import { returnJSON, returnNotFound, withRequestBody, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { StoreUploadedFile, UploadedFile, processImage } from "@/lib/upload"
import { Asset, AssetSchema } from "@/models/asset"
import axios from "axios"
import { z } from "zod"

const PutAssetItemResponseSchema = AssetSchema

const PutAssetItemRequestSchema = AssetSchema.pick({
    name: true,
    description: true,
    status: true,
}).extend({
    folder: z.string(),
    mirrorX: z.boolean().optional(),
    mirrorY: z.boolean().optional(),
    rotation: z.number().optional(),
    cropX: z.number().optional(),
    cropY: z.number().optional(),
    cropWidth: z.number().optional(),
    cropHeight: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),

})

export type PutAssetItemRequest = z.infer<typeof PutAssetItemRequestSchema>
export type PutAssetItemResponse = z.infer<typeof PutAssetItemResponseSchema>


export async function PUT(req: Request, context: { params: { spaceid: string; assetid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "any", async (role) => {
            return await withRequestBody(req, PutAssetItemRequestSchema, async (data) => {

                const asset = await collections.asset.findOne({ spaceId: context.params.spaceid, assetId: context.params.assetid })
                if (!asset) {
                    return returnNotFound("Asset not found");
                }
                let { name, description, status, folder, ...imageProperties } = data;
                let update = { name, description, status, folder }

                let updated = await collections.asset.updateOne({
                    spaceId: context.params.spaceid, assetId: context.params.assetid,

                }, { $set: { ...update, modifiedDate: new Date(), modifiedUserId: user.userId } })

                if (data.folder === "") {
                    await collections.asset.updateOne({
                        spaceId: context.params.spaceid, assetId: context.params.assetid,

                    }, { $unset: { assetFolderId: true } })
                } else {
                    await collections.asset.updateOne({
                        spaceId: context.params.spaceid, assetId: context.params.assetid,

                    }, { $set: { assetFolderId: data.folder } })
                }

                if (asset.type === "image") {

                    if (imageProperties.mirrorX || imageProperties.mirrorY || imageProperties.cropHeight || imageProperties.height) {
                        const res = await axios.get(asset.url, {
                            responseType: "arraybuffer",
                        });
                        let buffer = Buffer.from(res.data)
                        buffer = await processImage(buffer, imageProperties)
                        let uploadedFile: UploadedFile = {
                            buffer,
                            type: "image",
                            ext: asset.ext,
                            filename: asset.filename
                        }
                        const result = await StoreUploadedFile(uploadedFile)
                        if (result) {
                            updated = await collections.asset.updateOne({
                                assetId: context.params.assetid,
                                spaceId: context.params.spaceid
                            }, {
                                $set: {
                                    url: result.location,
                                    filename: uploadedFile.filename,
                                    fileKeys: [...asset.fileKeys, result.key]
                                }
                            })
                        }


                    }

                }
                return returnJSON<Asset>(updated!, AssetSchema)
            })
        })
    })
}


export const PUT_DOC: generateRouteInfoParams = {
    tags: ["asset"],
    path: "/space/:spaceid/asset/:assetid",
    method: "put",
    summary: "Get asset",
    requiresAuth: "user-jwt-token",
    params: ["spaceid", "assetid"],
    requestSchema: PutAssetItemRequestSchema,
    responseSchema: PutAssetItemResponseSchema,
    responseDescription: "Asset updated",
    errors: {
        ERROR_NOTFOUND: "Asset not found"
    }
}