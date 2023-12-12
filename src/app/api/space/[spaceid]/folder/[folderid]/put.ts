import { returnJSON, returnNotFound, withRequestBody, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { camelize } from "@/lib/utils"
import { FolderSchema } from "@/models/folder"
import { z } from "zod"

const PutFolderItemRequestSchema = FolderSchema.pick({
    name: true,
    contentTypes: true,
})
export type PutFolderItemRequest = z.infer<typeof PutFolderItemRequestSchema>

const PutFolderItemResponseSchema = FolderSchema

export type PutFolderItemResponse = z.infer<typeof PutFolderItemResponseSchema>

export async function PUT(req: Request, context: { params: { spaceid: string; folderid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "any", async (role) => {
            return await withRequestBody(req, PutFolderItemRequestSchema, async (data) => {
                const updated = await collections.folder.updateOne(
                    {
                        spaceId: context.params.spaceid,
                        folderId: context.params.folderid,
                    },
                    {
                        $set: data,
                    }
                )

                return returnJSON<PutFolderItemResponse>(updated!, PutFolderItemResponseSchema)
            })
        })
    })
}


export const PUT_DOC: generateRouteInfoParams = {
    tags: ["content folder"],
    path: "/space/:spaceid/folder/:folderid",
    method: "put",
    summary: "Update content folder",
    requiresAuth: "user-jwt-token",
    params: ["spaceid", "folderid"],
    requestSchema: PutFolderItemRequestSchema,
    responseSchema: PutFolderItemResponseSchema,
    responseDescription: "Folder successfully updated",
    errors: {
        ERROR_NOTFOUND: "Folder not found"
    }
}