import { returnJSON, returnNotFound, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { z } from "zod"

export const GetAccesskeyItemResponseSchema = z.object({
    key: z.string(),
})
export type GetAccesskeyItemResponse = z.infer<typeof GetAccesskeyItemResponseSchema>

export async function GET(req: Request, context: { params: { spaceid: string; keyid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "owner", async (role) => {
            const accessKey = await collections.accessKey.findOne({ spaceId: context.params.spaceid, keyId: context.params.keyid })
            if (!accessKey) {
                return returnNotFound("Accesskey not found")
            }

            return returnJSON<{}>({ key: accessKey.key }, z.object({}))
        })
    })
}


export const GET_DOC: generateRouteInfoParams = {
    tags: ["accesskey"],
    path: "/space/:spaceid/accesskey/:keyid",
    method: "get",
    summary: "Get access key",
    requiresAuth: "user-jwt-token",
    params: ["spaceid", "keyid"],
    responseSchema: GetAccesskeyItemResponseSchema,
    responseDescription: "Access key",
    errors: {
        ERROR_NOTFOUND: "Access key not found"

    }

}