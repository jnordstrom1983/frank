import { returnJSON, returnNotFound, withUser } from "@/lib/apiUtils"
import { dbCollection } from "@/lib/constants"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { SpaceUserRoleEnum } from "@/models/spaceuser"
import { UserSchema } from "@/models/user"
import { z } from "zod"

export const UserSpaceSchema = z.object({
    spaceId: z.string(),
    name: z.string(),
    role: SpaceUserRoleEnum,
})

export const GetUserItemResponseSchema = UserSchema.extend({
    spaces: z.array(UserSpaceSchema),
})

export type GetUserItemResponse = z.infer<typeof GetUserItemResponseSchema>
export type UserSpace = z.infer<typeof UserSpaceSchema>

export async function GET(req: Request, context: { params: { userid: string } }) {
    return await withUser(req, "admin", async () => {
        const user = await collections.user.findOne({ userId: context.params.userid })
        if (!user) {
            return returnNotFound("User does not exists")
        }
        const spaces = await collections.spaceUser.aggregate<UserSpace>([
            {
                $match: { userId: user.userId },
            },
            {
                $lookup: {
                    from: dbCollection.space,
                    localField: "spaceId",
                    foreignField: "spaceId",

                    as: "spaces",
                },
            },
            {
                $project: {
                    spaceId: 1,
                    role: 1,
                    space: { $arrayElemAt: ["$spaces", 0] },
                },
            },
            {
                $project: {
                    spaceId: 1,
                    role: 1,
                    name: { $ifNull: ["$space.name", "-"] },
                },
            },
        ])

        return returnJSON<GetUserItemResponse>({ ...user, spaces }, GetUserItemResponseSchema)
    })
}


export const GET_DOC: generateRouteInfoParams = {
    tags: ["user"],
    path: "/user/:userid",
    method: "get",
    summary: "Get a Frank users",
    requiresAuth: "user-jwt-token",
    params: ["userid"],
    responseSchema: GetUserItemResponseSchema,
    responseDescription: "User",
    errors: {
        ERROR_NOTFOUND: "User does not exists"
    }

}
