import { returnJSON, withSpaceRole, withUser } from "@/lib/apiUtils"
import { dbCollection } from "@/lib/constants"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { SpaceUserRoleEnum } from "@/models/spaceuser"
import { z } from "zod"

const SpaceUserItemSchema = z.object({
    userId: z.string(),
    role: SpaceUserRoleEnum,
    email: z.string().email().toLowerCase(),
    name: z.string(),
    tags : z.array(z.string()),
})
type SpaceUserItem = z.infer<typeof SpaceUserItemSchema>

const GetSpaceUserResponseSchema = z.object({
    users: z.array(SpaceUserItemSchema),
})

export type GetSpaceUserResponse = z.infer<typeof GetSpaceUserResponseSchema>

export async function GET(req: Request, context: { params: { spaceid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "owner", async (role) => {
            const users = await collections.spaceUser.aggregate<SpaceUserItem>([
                {
                    $match: {
                        spaceId: context.params.spaceid,
                    },
                },
                {
                    $lookup: {
                        from: dbCollection.user,
                        localField: "userId",
                        foreignField: "userId",

                        as: "users",
                    },
                },

                {
                    $project: {
                        userId: 1,
                        role: 1,
                        tags: 1,
                        user: { $arrayElemAt: ["$users", 0] },
                    },
                },
                {
                    $match: {
                        "user.type": "user",
                    },
                },

                {
                    $project: {
                        _id: 0,
                        userId: 1,
                        role: 1,
                        tags: 1,
                        email: "$user.email",
                        name: "$user.name",
                    },
                },
                {
                    $sort: {
                        name: 1,
                        email: 1,
                    },
                },
            ])

            return returnJSON<GetSpaceUserResponse>({ users }, GetSpaceUserResponseSchema)
        })
    })
}


export const GET_DOC: generateRouteInfoParams = {
    tags: ["user"],
    path: "/space/:spaceid/user",
    method: "get",
    summary: "List users",
    requiresAuth: "user-jwt-token",
    params: ["spaceid"],
    responseSchema: GetSpaceUserResponseSchema,
    responseDescription: "List of users",
    errors: {

    }
}