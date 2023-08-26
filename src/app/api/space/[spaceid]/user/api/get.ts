import { returnJSON, withSpaceRole, withUser } from "@/lib/apiUtils"
import { dbCollection } from "@/lib/constants"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { SpaceUserRoleEnum } from "@/models/spaceuser"
import { z } from "zod"

const SpaceApiUserItemSchema = z.object({
    userId: z.string(),
    role: SpaceUserRoleEnum,
    name: z.string(),
})
type SpaceApiUserItem = z.infer<typeof SpaceApiUserItemSchema>

const GetSpaceApiUserResponseSchema = z.object({
    users: z.array(SpaceApiUserItemSchema),
})

export type GetSpaceApiUserResponse = z.infer<typeof GetSpaceApiUserResponseSchema>

export async function GET(req: Request, context: { params: { spaceid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "owner", async (role) => {
            const users = await collections.spaceUser.aggregate<SpaceApiUserItem>([
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
                        user: { $arrayElemAt: ["$users", 0] },
                    },
                },
                {
                    $match: {
                        "user.type": "key",
                    },
                },

                {
                    $project: {
                        _id: 0,
                        userId: 1,
                        role: 1,
                        name: "$user.name",
                    },
                },
                {
                    $sort: {
                        name: 1,
                    },
                },
            ])

            return returnJSON<GetSpaceApiUserResponse>({ users }, GetSpaceApiUserResponseSchema)
        })
    })
}


export const GET_DOC: generateRouteInfoParams = {
    tags: ["api key"],
    path: "/space/:spaceid/user/api",
    method: "get",
    summary: "List api keys",
    requiresAuth: "user-jwt-token",
    params: ["spaceid"],
    responseSchema: GetSpaceApiUserResponseSchema,
    responseDescription: "List of api keys",
    errors: {

    }
}