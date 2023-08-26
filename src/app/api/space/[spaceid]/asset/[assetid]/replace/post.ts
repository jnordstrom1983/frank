import { returnError, returnJSON, returnNotFound, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { HandleUploadRequest, StoreUploadedFile } from "@/lib/upload"
import { AssetSchema } from "@/models/asset"
import { z } from "zod"

export const PostAssetResponseSchema = AssetSchema
export type PostAssetResponse = z.infer<typeof PostAssetResponseSchema>

export async function POST(req: Request, context: { params: { spaceid: string, assetid: string } }) {

    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "any", async (role) => {
            const asset = await collections.asset.findOne({
                assetId: context.params.assetid,
                spaceId: context.params.spaceid
            });
            if (!asset) {
                return returnNotFound("Asset not found");
            }
            const uploadedFile = await HandleUploadRequest(req);

            if (uploadedFile) {
                const result = await StoreUploadedFile(uploadedFile)
                if (result) {
                    const updated = await collections.asset.updateOne({
                        assetId: context.params.assetid,
                        spaceId: context.params.spaceid
                    }, {
                        $set: {
                            url: result.location,
                            filename: uploadedFile.filename,
                            fileKeys: [...asset.fileKeys, result.key]
                        }
                    })

                    return returnJSON<PostAssetResponse>(updated!, PostAssetResponseSchema)
                } else {
                    return returnError({ error: "Internal server error", code: 500 })
                }
            }
            return returnNotFound("No file suplied")
        })
    })

}

export const POST_REPLACE_DOC: generateRouteInfoParams = {
    tags: ["asset"],
    path: "/space/:spaceid/asset/:assetid",
    method: "post",
    summary: "Replace assets",
    requiresAuth: "user-jwt-token",
    params: ["spaceid", "assetid"],
    requestSchema: z.object({
        file: z.any(),
        filename: z.string(),
        mirrorX: z.string().optional(),
        mirrorY: z.string().optional(),
        rotation: z.number().optional(),
        cropX: z.number().optional(),
        cropY: z.number().optional(),
        cropWidth: z.number().optional(),
        cropHeight: z.number().optional(),
    }),
    responseSchema: PostAssetResponseSchema,
    responseDescription: "Asset successfully updated",
    customRequestContentType: "multipart/form-data",
    errors: {

    }
}

