import { z } from "zod"

export const AccessKeySchema = z.object({
    keyId: z.string(),
    spaceId: z.string(),
    name: z.string(),
    key : z.string(),
    allContent: z.boolean(),
    contentTypes: z.array(z.string()),
    drafts : z.boolean(),
})

export type AccessKey = z.infer<typeof AccessKeySchema>
