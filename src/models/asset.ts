import { string, z } from "zod";

export const AssetTypeEnumSchema = z.enum(["image", "file"])
export type AssetTypeEnum = z.infer<typeof AssetTypeEnumSchema>

export const AssetStatusEnumSchema = z.enum(["enabled", "disabled"])
export type AssetStatusEnum = z.infer<typeof AssetStatusEnumSchema>

export const AssetSchema = z.object({
    assetId: z.string(),
    spaceId: z.string(),
    assetFolderId: z.string().optional(),
    url: z.string(),
    type: AssetTypeEnumSchema,
    ext: z.string(),
    filename: z.string(),
    name: z.string(),
    description: z.string(),
    createdUserId: z.string(),
    createdDate: z.date(),
    modifiedUserId: z.string(),
    modifiedDate: z.date(),
    status: AssetStatusEnumSchema,
    fileKeys: z.array(z.string())

})
export type Asset = z.infer<typeof AssetSchema>


export const AssetInternalViewModelSchema = AssetSchema.pick({
    assetId: true,
    type: true,
    assetFolderId: true,
    name: true,
    createdDate: true,
    modifiedUserId: true,
    modifiedDate: true,
    status: true,
}).extend({
    folderName: z.string().optional(),
    modifiedUserName: z.string(),

})

export type AssetInternalViewModel = z.infer<typeof AssetInternalViewModelSchema>