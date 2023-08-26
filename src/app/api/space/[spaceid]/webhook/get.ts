import { returnJSON, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { WebhookSchema } from "@/models/webhook"
import { z } from "zod"

const GetWebhookResponseSchema = z.object({
    webhooks: z.array(WebhookSchema),
})

export type GetWebhookResponse = z.infer<typeof GetWebhookResponseSchema>

export async function GET(req: Request, context: { params: { spaceid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "owner", async (role) => {
            const webhooks = await collections.webhook.findMany({ spaceId: context.params.spaceid })

            const responseItem: GetWebhookResponse = {
                webhooks,
            }
            return returnJSON<GetWebhookResponse>(responseItem, GetWebhookResponseSchema)
        })
    })
}


export const GET_DOC: generateRouteInfoParams = {
    tags: ["webhook"],
    path: "/space/:spaceid/webhook",
    method: "get",
    summary: "List webhooks",
    requiresAuth: "user-jwt-token",
    params: ["spaceid"],
    responseSchema: GetWebhookResponseSchema,
    responseDescription: "List of webhooks",
    errors: {

    }
}