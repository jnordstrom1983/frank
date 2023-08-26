import { returnJSON, returnNotFound, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { WebhookEventSchema } from "@/models/webhook"
import { z } from "zod"

const GetWebhookEventItemResponseSchema = WebhookEventSchema

export type GetWebhookEventItemResponse = z.infer<typeof GetWebhookEventItemResponseSchema>

export async function GET(req: Request, context: { params: { spaceid: string; webhookid: string; eventid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "owner", async (role) => {
            const event = await collections.webhookEvent.findOne({ spaceId: context.params.spaceid, webhookId: context.params.webhookid, webhookEventId: context.params.eventid })

            if (!event) {
                return returnNotFound("Event not found")
            }

            return returnJSON<GetWebhookEventItemResponse>(event, GetWebhookEventItemResponseSchema)
        })
    })
}
