import { z } from "zod";
import { ContentSchema } from "./content";
import { ContentDataSchema } from "./contentdata";


export const WebhookEventsEnumSchema = z.enum(["draft.update", "draft.delete", "content.publish", "content.update", "content.unpublish", "content.delete"])
export type WebhookEventsEnum = z.infer<typeof WebhookEventsEnumSchema>

export const WebhookSchema = z.object({
    spaceId : z.string(),
    webhookId : z.string(),
    events : z.array(WebhookEventsEnumSchema),
    endpoint : z.string().url(),
    enabled : z.boolean(),
})
export type Webhook = z.infer<typeof WebhookSchema>


export const WebhookEventStatusEnumSchema = z.enum(["pending", "trying", "success", "error"])
export type WebhookEventStatusEnumS = z.infer<typeof WebhookEventStatusEnumSchema>

export const WebhookEventTaskSchema = z.object({
    taskId : z.string(),
    created : z.date(),
    responseCode : z.number(),
    responseText : z.string().optional(),
    success : z.boolean(),
})
export type WebhookEventTask = z.infer<typeof WebhookEventTaskSchema>


export const WebhookEventPayloadSchema = z.object({
    webhookEventId : z.string(),
    webhookId : z.string(),
    spaceId : z.string(),
    event : WebhookEventsEnumSchema,
    content : ContentSchema.pick({
        contentId : true,
        contentTypeId : true,
        folderId : true,
        status : true,
    }).extend({
        data : z.array(ContentDataSchema.pick({ languageId : true, data : true}))
    }).or(z.object({
        contentId : z.string()
    }))
})
export type WebhookEventPayload = z.infer<typeof WebhookEventPayloadSchema>


export const WebhookEventSchema = z.object({
    webhookEventId : z.string(),
    webhookId : z.string(),
    spaceId : z.string(),
    status : WebhookEventStatusEnumSchema,
    payload : WebhookEventPayloadSchema,
    requests : z.array(WebhookEventTaskSchema),
    created : z.date()
})
export type WebhookEvent = z.infer<typeof WebhookEventSchema>

