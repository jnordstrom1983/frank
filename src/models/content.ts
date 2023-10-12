import { z } from "zod"
import { SpaceModuleEnum } from "./space"

export const ContentStatusSchema = z.enum(["new", "draft", "published"])
export type  ContentStatus = z.infer<typeof ContentStatusSchema>

export const ContentSchema = z.object({
    contentId: z.string(),
    contentTypeId: z.string(),
    spaceId: z.string(),
    createdUserId: z.string(),
    createdDate: z.date(),
    modifiedUserId: z.string(),
    modifiedDate: z.date(),
    publishDate : z.date().optional(),
    folderId : z.string().optional(),
    activeHistoryId : z.string().optional(),
    status: ContentStatusSchema,
    scheduledPublishDate : z.date().optional(),
    scheduledDepublishDate : z.date().optional(),
    managedByModule : SpaceModuleEnum.optional(),
})

export type Content = z.infer<typeof ContentSchema>



export const ContentInternalViewModelSchema = ContentSchema.pick({
    contentId : true, 
    contentTypeId : true, 
    folderId : true,
    createdDate : true,
    modifiedUserId : true,
    modifiedDate: true,
    publishDate: true,
    status : true,
    scheduledPublishDate : true,
    scheduledDepublishDate : true,
    managedByModule : true
}).extend({
    title : z.string(), 
    folderName : z.string().optional(),
    contentTypeName : z.string(),
    modifiedUserName : z.string(),
    
})

export type ContentInternalViewModel = z.infer<typeof ContentInternalViewModelSchema>