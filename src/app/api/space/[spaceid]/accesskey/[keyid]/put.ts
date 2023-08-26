import { returnJSON, withRequestBody, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { AccessKeySchema } from "@/models/accesskey"
import { z } from "zod"

const PutAccesskeyItemRequestSchema = AccessKeySchema.pick({
    name: true,
    contentTypes: true,
    allContent: true,
})
export type PutAccesskeyItemRequest = z.infer<typeof PutAccesskeyItemRequestSchema>

const PutAccesskeyItemResponseSchema = z.object({})

export type PutAccesskeyItemResponse = z.infer<typeof PutAccesskeyItemResponseSchema>

export async function PUT(req: Request, context: { params: { spaceid: string; keyid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "owner", async (role) => {
            return await withRequestBody(req, PutAccesskeyItemRequestSchema, async (data) => {
                const updated = await collections.accessKey.updateOne(
                    {
                        spaceId: context.params.spaceid,
                        keyId: context.params.keyid,
                    },
                    {
                        $set: data,
                    }
                )

                return returnJSON<PutAccesskeyItemResponse>(updated!, PutAccesskeyItemResponseSchema)
            })
        })
    })
}

export const PUT_DOC: generateRouteInfoParams = {
    tags: ["accesskey"],
    path: "/space/:spaceid/accesskey/:keyid",
    method: "put",
    summary: "Update access key",
    requiresAuth: "user-jwt-token",
    params: ["spaceid", "keyid"],
    requestSchema: PutAccesskeyItemRequestSchema,
    responseSchema: PutAccesskeyItemResponseSchema,
    responseDescription: "Access key successfully updated",
    errors: {
        ERROR_NOTFOUND: "Access key not found"

    }

}