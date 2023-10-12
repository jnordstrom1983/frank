import { z } from "zod";
import { FieldSchema } from "./field";
import { SpaceModuleEnum } from "./space";




export const ContentTypeSchema = z.object({
    contentTypeId: z.string(),
    spaceId: z.string(),
    creatorUserId: z.string(),
    name: z.string().min(3),
    enabled: z.boolean(),
    generateSlug : z.boolean(),
    hidden: z.boolean(),
    fields : z.array(FieldSchema),
    managedByModule : SpaceModuleEnum.optional(),
    
})

export type ContentType = z.infer<typeof ContentTypeSchema>



