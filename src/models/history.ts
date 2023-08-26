import { z } from "zod";
import { ContentDataSchema } from "./contentdata";
import { SpaceLanguageEnum } from "./space";

export const HistoryItemChangeTypeEnum = z.enum(["created", "updated", "deleted"])
export type HistoryItemChangeType = z.infer<typeof HistoryItemChangeTypeEnum>

export const HistoryItemChangeSchema= z.object({
    changeId : z.string(),
    fieldId : z.string(),
    languageId : SpaceLanguageEnum,
    valueBefore : z.any().optional(),
    valueAfter : z.any().optional(),
    type : HistoryItemChangeTypeEnum

})
export type HistoryItemChange = z.infer<typeof HistoryItemChangeSchema>

export const HistoryItemSchema = z.object({
    historyId : z.string(),
    revision : z.number(),
    contentId : z.string(),
    date : z.date(),
    userId : z.string(),
    changes : z.array(HistoryItemChangeSchema),
    datas : z.array(ContentDataSchema)
})

export type HistoryItem = z.infer<typeof HistoryItemSchema>