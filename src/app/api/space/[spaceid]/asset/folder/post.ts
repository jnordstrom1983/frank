import { returnJSON, returnNotFound, withRequestBody, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { camelize } from "@/lib/utils"
import { AssetFolderSchema } from "@/models/assetfolder"
import { FolderSchema } from "@/models/folder"
import { z } from "zod"



const PostAssetFolderRequestSchema = z.object({
    name: z.string()
}).extend({
    folderId  : z.string().optional()
})

export type PostAssetFolderRequest = z.infer<typeof PostAssetFolderRequestSchema>

const PostAssetFolderResponseSchema = AssetFolderSchema

export type PostAssetFolderResponse = z.infer<typeof PostAssetFolderResponseSchema>

export async function POST(req: Request, context: { params: { spaceid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "owner", async (role) => {
            return await withRequestBody(req, PostAssetFolderRequestSchema, async (data) => {


                let folderId = data.folderId ?? camelize(data.name)
                let extra = 0;
                let folder = await collections.assetFolder.findOne({ spaceId: context.params.spaceid, folderId: folderId })
                while (folder) {
                    extra++;
                    folderId = camelize(`${data.name}${extra}`)
                    folder = await collections.assetFolder.findOne({ spaceId: context.params.spaceid, folderId: folderId })
                }

                const created = await collections.assetFolder.create({
                    spaceId: context.params.spaceid,
                    folderId,
                    name: data.name,

                })

                return returnJSON<PostAssetFolderResponse>(created!, PostAssetFolderResponseSchema)
            })
        })
    })
}


export const POST_DOC: generateRouteInfoParams = {
    tags: ["asset folder"],
    path: "/space/:spaceid/asset/folder",
    method: "post",
    summary: "Create new asset folder",
    requiresAuth: "user-jwt-token",
    params: ["spaceid"],
    requestSchema: PostAssetFolderRequestSchema,
    responseSchema: PostAssetFolderResponseSchema,
    responseDescription: "Folder created",
    errors: {

    }
}