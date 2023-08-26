import { returnJSON, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { WebhookEventSchema, WebhookEventsEnumSchema } from "@/models/webhook"
import { z } from "zod"

const GetWebhookEventResponseItemSchema = WebhookEventSchema.pick({
    webhookEventId: true,
    status: true,
    created: true,
    
    
}).extend({
    event : WebhookEventsEnumSchema,
    contentId : z.string()
})
export type GetWebhookEventResponseItem = z.infer<typeof GetWebhookEventResponseItemSchema>

const GetWebhookEventResponseSchema = z.object({
    events: z.array(GetWebhookEventResponseItemSchema),
})

export type GetWebhookEventResponse = z.infer<typeof GetWebhookEventResponseSchema>

export async function GET(req: Request, context: { params: { spaceid: string; webhookid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "owner", async (role) => {
            const events = await collections.webhookEvent.aggregate<GetWebhookEventResponseItem>([
                {
                    $match: {
                        spaceId: context.params.spaceid,
                        webhookId: context.params.webhookid,
                    },
                },
                {
                    $project: {
                        _id: 0,
                        webhookEventId: 1,
                        status: 1,
                        created: 1,
                        event : "$payload.event",
                        contentId : "$payload.content.contentId"
                    },
                },
                {
                    $sort : {
                        created : -1
                    }
                }
            ])

            const responseItem: GetWebhookEventResponse = {
                events,
            }
            return returnJSON<GetWebhookEventResponse>(responseItem, GetWebhookEventResponseSchema)
        })
    })
}
