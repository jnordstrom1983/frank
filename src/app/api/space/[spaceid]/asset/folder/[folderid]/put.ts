import { returnJSON, returnNotFound, withRequestBody, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { camelize } from "@/lib/utils"
import { AssetFolderSchema } from "@/models/assetfolder"
import { FolderSchema } from "@/models/folder"
import { z } from "zod"

const PutAssetFolderItemRequestSchema = AssetFolderSchema.pick({
    name: true,

})
export type PutAssetFolderItemRequest = z.infer<typeof PutAssetFolderItemRequestSchema>

const PutAssetFolderItemResponseSchema = AssetFolderSchema

export type PutAssetFolderItemResponse = z.infer<typeof PutAssetFolderItemResponseSchema>

export async function PUT(req: Request, context: { params: { spaceid: string; folderid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "owner", async (role) => {
            return await withRequestBody(req, PutAssetFolderItemRequestSchema, async (data) => {
                const updated = await collections.assetFolder.updateOne(
                    {
                        spaceId: context.params.spaceid,
                        folderId: context.params.folderid,
                    },
                    {
                        $set: data,
                    }
                )

                return returnJSON<PutAssetFolderItemResponse>(updated!, PutAssetFolderItemResponseSchema)
            })
        })
    })
}

export const PUT_DOC: generateRouteInfoParams = {
    tags: ["asset folder"],
    path: "/space/:spaceid/asset/folder/:folderid",
    method: "put",
    summary: "Update asset folder",
    requiresAuth: "user-jwt-token",
    params: ["spaceid", "folderid"],
    requestSchema: PutAssetFolderItemRequestSchema,
    responseSchema: PutAssetFolderItemResponseSchema,
    responseDescription: "Folder successfully updated",
    errors: {
        ERROR_NOTFOUND: "Folder not found"
    }
}