import { returnJSON, withRequestBody, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { Webhook, WebhookSchema } from "@/models/webhook"
import shortUUID from "short-uuid"
import { z } from "zod"

const PostWebhookRequestSchema = WebhookSchema.pick({
    events: true,
    endpoint: true,
})

export type PostWebhookRequest = z.infer<typeof PostWebhookRequestSchema>

const PostWebhookResponseSchema = WebhookSchema

export type PostWebhookResponse = z.infer<typeof PostWebhookResponseSchema>

export async function POST(req: Request, context: { params: { spaceid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "owner", async (role) => {
            return await withRequestBody(req, PostWebhookRequestSchema, async (data) => {
                const webhook: Webhook = {
                    ...data,
                    spaceId: context.params.spaceid,
                    webhookId: shortUUID().generate(),
                    enabled: true,
                }
                const created = await collections.webhook.create(webhook)

                return returnJSON<PostWebhookResponse>(created!, PostWebhookResponseSchema)
            })
        })
    })
}


export const POST_DOC: generateRouteInfoParams = {
    tags: ["webhook"],
    path: "/space/:spaceid/webhook",
    method: "post",
    summary: "Create webhooks",
    requiresAuth: "user-jwt-token",
    params: ["spaceid"],
    requestSchema: PostWebhookRequestSchema,
    responseSchema: PostWebhookResponseSchema,
    responseDescription: "Webhook created",
    errors: {

    }
}
