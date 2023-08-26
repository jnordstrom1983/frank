import { returnJSON, returnNotFound, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { jwtType, sign } from "@/lib/jwt"
import { z } from "zod"

const GetSpaceApiUserItemResponseSchema = z.object({
    token: z.string(),
})

export type GetSpaceApiUserItemResponse = z.infer<typeof GetSpaceApiUserItemResponseSchema>

export async function GET(req: Request, context: { params: { spaceid: string; userid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "owner", async (role) => {
            const user = await collections.spaceUser.findOne({ userId: context.params.userid, spaceId: context.params.spaceid })
            if (!user) {
                return returnNotFound("User not found")
            }

            const token = sign(jwtType.authToken, { userId: user.userId }, {})

            return returnJSON<GetSpaceApiUserItemResponse>({ token }, GetSpaceApiUserItemResponseSchema)
        })
    })
}


export const GET_DOC: generateRouteInfoParams = {
    tags: ["api key"],
    path: "/space/:spaceid/user/api/:userid",
    method: "get",
    summary: "Get api key",
    requiresAuth: "user-jwt-token",
    params: ["spaceid", "userid"],
    responseSchema: GetSpaceApiUserItemResponseSchema,
    responseDescription: "Delete api key",
    errors: {
        ERROR_NOTFOUND: "User not found"
    }
}