import { z } from "zod";


export const AssetFolderSchema = z.object({
    spaceId: z.string(),
    folderId: z.string(),
    name: z.string(),

})

export type AssetFolder = z.infer<typeof AssetFolderSchema>



