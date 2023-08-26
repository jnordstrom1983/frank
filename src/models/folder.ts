import { z } from "zod";




export const FolderSchema = z.object({
    spaceId: z.string(),
    folderId : z.string(),
    name : z.string(),
    contentTypes : z.array(z.string())

})

export type Folder = z.infer<typeof FolderSchema>



