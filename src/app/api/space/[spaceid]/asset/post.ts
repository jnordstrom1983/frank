import { returnError, returnJSON, returnNotFound, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { HandleUploadRequest, StoreUploadedFile } from "@/lib/upload"
import { Asset, AssetSchema } from "@/models/asset"
import shortUUID from "short-uuid"
import { z } from "zod"

export const PostAssetResponseSchema = AssetSchema
export type PostAssetResponse = z.infer<typeof PostAssetResponseSchema>

export async function POST(req: Request, context: { params: { spaceid: string } }) {

    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "any", async (role) => {
            const uploadedFile = await HandleUploadRequest(req);

            if (uploadedFile) {
                const result = await StoreUploadedFile(uploadedFile)
                if (result) {
                    const asset: Asset = {
                        assetId: shortUUID().generate(),
                        spaceId: context.params.spaceid,
                        url: result.location,
                        type: uploadedFile.type,
                        ext: uploadedFile.ext.toLocaleLowerCase(),
                        filename: uploadedFile.filename,
                        name: uploadedFile.filename,
                        description: "",
                        createdUserId: user.userId,
                        createdDate: new Date(),
                        modifiedUserId: user.userId,
                        modifiedDate: new Date(),
                        status: "enabled",
                        fileKeys: [result.key]
                    }
                    const created = await collections.asset.create(asset);

                    return returnJSON<PostAssetResponse>(created!, PostAssetResponseSchema)
                } else {
                    return returnError({ error: "Internal server error", code: 500 })
                }
            }
            return returnNotFound("No file suplied")
        })
    })

}


export const POST_DOC: generateRouteInfoParams = {
    tags: ["asset"],
    path: "/space/:spaceid/asset",
    method: "post",
    summary: "Create assets",
    requiresAuth: "user-jwt-token",
    params: ["spaceid"],
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
    responseDescription: "Asset created",
    customRequestContentType: "multipart/form-data",
    errors: {

    }
}


