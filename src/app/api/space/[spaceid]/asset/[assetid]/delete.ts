import { returnJSON, returnNotFound, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { DeleteFile } from "@/lib/upload"
import { AssetSchema } from "@/models/asset"
import { z } from "zod"

const DeleteAssetItemResponseSchema = z.object({})

export type DeleteAssetItemResponse = z.infer<typeof DeleteAssetItemResponseSchema>

export async function DELETE(req: Request, context: { params: { spaceid: string, assetid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "any", async (role) => {
            const asset = await collections.asset.findOne({ spaceId: context.params.spaceid, assetId: context.params.assetid })
            if (!asset) {
                return returnNotFound("Asset not found")
            }

            for (const key of asset.fileKeys) {
                await DeleteFile(key)
            }

            await collections.asset.deleteMany({ spaceId: context.params.spaceid, assetId: context.params.assetid })

            return returnJSON<DeleteAssetItemResponse>(
                {},
                DeleteAssetItemResponseSchema
            )
        })
    })
}


export const DELETE_DOC: generateRouteInfoParams = {
    tags: ["asset"],
    path: "/space/:spaceid/asset/:assetid",
    method: "delete",
    summary: "Delete asset",
    requiresAuth: "user-jwt-token",
    params: ["spaceid", "assetid"],
    responseSchema: DeleteAssetItemResponseSchema,
    responseDescription: "Asset successfully deleted",
    errors: {
        ERROR_NOTFOUND: "Asset not found"
    }
}