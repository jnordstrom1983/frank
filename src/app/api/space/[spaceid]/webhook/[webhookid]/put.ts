import { returnJSON, withRequestBody, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { WebhookSchema } from "@/models/webhook"
import { z } from "zod"

const PutWebhookItemRequestSchema = WebhookSchema.pick({
    events: true,
    endpoint: true,
    enabled: true,
})
export type PutWebhookItemRequest = z.infer<typeof PutWebhookItemRequestSchema>

const PutWebhookItemResponseSchema = WebhookSchema

export type PutWebhookItemResponse = z.infer<typeof PutWebhookItemResponseSchema>

export async function PUT(req: Request, context: { params: { spaceid: string; webhookid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "owner", async (role) => {
            return await withRequestBody(req, PutWebhookItemRequestSchema, async (data) => {
                const updated = await collections.webhook.updateOne(
                    {
                        spaceId: context.params.spaceid,
                        webhookId: context.params.webhookid,
                    },
                    {
                        $set: data,
                    }
                )

                return returnJSON<PutWebhookItemResponse>(updated!, PutWebhookItemResponseSchema)
            })
        })
    })
}


export const PUT_DOC: generateRouteInfoParams = {
    tags: ["webhook"],
    path: "/space/:spaceid/webhook/:webhookid",
    method: "put",
    summary: "Update webhook",
    requiresAuth: "user-jwt-token",
    params: ["spaceid", "webhookid"],
    requestSchema: PutWebhookItemRequestSchema,
    responseSchema: PutWebhookItemResponseSchema,
    responseDescription: "Update webhook",
    errors: {
        ERROR_NOTFOUND: "Webhook not found"
    }
}