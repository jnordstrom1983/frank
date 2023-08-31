import { z } from "zod"
import { SpaceLanguageEnum } from "./space"
import { ContentStatusSchema } from "./content"

export const ContentDataSchema = z.object({
    contentDataId: z.string(),
    spaceId: z.string(),
    contentTypeId: z.string(),
    contentId: z.string(),
    folderId: z.string().optional(),
    languageId: SpaceLanguageEnum,
    modifiedUserId: z.string(),
    modifiedDate: z.date(),
    data: z.record(z.string(), z.any()),
    referencedAssets: z.array(z.string()).optional(),
    status: ContentStatusSchema,
    publishDate : z.date().optional(),
    slug : z.string().optional()
})
export type ContentData = z.infer<typeof ContentDataSchema>

export const ContentDataAggregationSchema = z.object({
    contentDataId: z.string(),
    spaceId: z.string(),
    contentTypeId: z.string(),
    contentId: z.string(),
    folderId: z.string().optional(),
    languageId: SpaceLanguageEnum,
    modifiedUserId: z.string(),
    modifiedDate: z.date(),
    publishDate : z.date().optional(),
    data: z.record(z.string(), z.any()),
    referencedAssets: z.array(z.string()).optional(),
    status: ContentStatusSchema,
    slug : z.string().optional(),
})
export type ContentDataAggregation = z.infer<typeof ContentDataAggregationSchema>

export const ContentDataViewSchema = z.object({
    contentTypeId: z.string(),
    contentId: z.string(),
    folderId: z.string().optional(),
    languageId: SpaceLanguageEnum,
    modifiedDate: z.date(),
    publishDate : z.date().optional(),
    slug : z.string().optional(),
    data: z.record(z.string(), z.any()),
})
export type ContentDataView = z.infer<typeof ContentDataViewSchema>



