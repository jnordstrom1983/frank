import { z } from "zod"

export const ContentDataHistorySchema = z.object({
    historyId: z.string(),
    contentDataId: z.string(),
    modifiedUserId: z.string(),
    modifiedDate: z.date(),
    data: z.record(z.string(), z.any()),
})
export type ContentDataHistory = z.infer<typeof ContentDataHistorySchema>
