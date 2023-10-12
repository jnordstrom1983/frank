import { returnJSON, returnNotFound, withRequestBody, withUser } from "@/lib/apiUtils"
import { Permissions, dbCollection } from "@/lib/constants"
import { z } from "zod"
import clientPromise from "@/lib/mongodb"
import { User } from "@/models/user"
import { WithId } from "mongodb"
import { jwtType, sign } from "@/lib/jwt"
import { v4 as uuidv4 } from "uuid"
import { collections } from "@/lib/db"
import { SpaceLanguageEnum, SpaceSchema } from "@/models/space"
import { SpaceUserRoleEnum } from "@/models/spaceuser"
import { generateRouteInfoParams } from "@/lib/docs"

export const GetSpaceItemSchema = SpaceSchema.pick({
    spaceId: true,
    name: true,
    defaultLanguage: true,
    contentAccess: true,
    modules : true
}).extend({
    role: SpaceUserRoleEnum.optional(),
    creatorName: z.string(),
    enableAi: z.boolean(),
})

export type SpaceItem = z.infer<typeof GetSpaceItemSchema>

const GetSpaceResponseSchema = z.object({
    spaces: GetSpaceItemSchema.array(),
})

export type GetSpaceResponse = z.infer<typeof GetSpaceResponseSchema>

export async function GET(req: Request) {
    return await withUser(req, "any", async (user) => {
        let spaces = await collections.space.aggregate<SpaceItem>([
            {
                $lookup: {
                    from: dbCollection.spaceUser,
                    let: { spaceId: "$spaceId" },
                    pipeline: [{ $match: { $expr: { $and: [{ $eq: ["$spaceId", "$$spaceId"] }, { $eq: ["$userId", user.userId] }] } } }],
                    as: "roles",
                },
            },

            {
                $lookup: {
                    from: dbCollection.user,
                    localField: "creatorUserId",
                    foreignField: "userId",

                    as: "creators",
                },
            },

            {
                $project: {
                    spaceId: 1,
                    name: 1,
                    defaultLanguage: 1,
                    contentAccess: 1,
                    modules : 1,
                    role: { $arrayElemAt: ["$roles", 0] },
                    creator: { $arrayElemAt: ["$creators", 0] },
                },
            },

            {
                $project: {
                    _id: 0,
                    spaceId: 1,
                    name: 1,
                    defaultLanguage: 1,
                    contentAccess: 1,
                    modules : 1,
                    role: "$role.role",
                    creatorName: "$creator.name",

                },
            },
            {
                $sort: {
                    name: 1
                }
            }
        ])

        if (user.role !== "admin") {
            spaces = spaces.filter((p) => p.role)
        }
        const data = spaces.map(space => {
            return {
                ...space,
                enableAi: !!process.env.OPENAI_APIKEY
            }
        })
        return returnJSON<z.infer<typeof GetSpaceResponseSchema>>({ spaces: data }, GetSpaceResponseSchema)
    })
}


export const GET_DOC: generateRouteInfoParams = {
    tags: ["space"],
    path: "/space",
    method: "get",
    summary: "List spaces",
    requiresAuth: "user-jwt-token",
    params: [],
    responseSchema: GetSpaceResponseSchema,
    responseDescription: "List of spaces",
    errors: {

    }
}