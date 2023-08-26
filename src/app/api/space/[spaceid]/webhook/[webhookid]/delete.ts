import { returnJSON, returnNotFound, withSpaceRole, withUser } from "@/lib/apiUtils";
import { collections } from "@/lib/db";
import { generateRouteInfoParams } from "@/lib/docs";
import { z } from "zod";

export async function DELETE(req: Request, context: { params: { spaceid: string; webhookid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "owner", async (role) => {
            const webhook = await collections.webhook.findOne({ spaceId: context.params.spaceid, webhookId: context.params.webhookid })
            if (!webhook) {
                return returnNotFound("Webhook not found")
            }
            collections.webhook.deleteMany({ spaceId: context.params.spaceid, webhookId: context.params.webhookid })
            collections.webhookEvent.deleteMany({ spaceId: context.params.spaceid, webhookId: context.params.webhookid })
            return returnJSON<{}>({}, z.object({}))
        })
    })
}


export const DELETE_DOC: generateRouteInfoParams = {
    tags: ["webhook"],
    path: "/space/:spaceid/webhook/:webhookid",
    method: "delete",
    summary: "List webhooks",
    requiresAuth: "user-jwt-token",
    params: ["spaceid", "webhookid"],
    responseSchema: z.object({}),
    responseDescription: "Delete webhook",
    errors: {
        ERROR_NOTFOUND: "Webhook not found"
    }
}