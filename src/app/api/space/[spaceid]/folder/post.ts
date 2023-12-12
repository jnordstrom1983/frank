import { returnJSON, returnNotFound, withRequestBody, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { camelize } from "@/lib/utils"
import { FolderSchema } from "@/models/folder"
import { z } from "zod"



const PostFolderRequestSchema = z.object({
    name: z.string()
}).extend({
    folderId : z.string().optional()
})

export type PostFolderRequest = z.infer<typeof PostFolderRequestSchema>

const PostFolderResponseSchema = FolderSchema

export type PostFolderResponse = z.infer<typeof PostFolderResponseSchema>

export async function POST(req: Request, context: { params: { spaceid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "any", async (role) => {
            return await withRequestBody(req, PostFolderRequestSchema, async (data) => {


                let folderId = data.folderId ?? camelize(data.name)
                let extra = 0;
                let folder = await collections.folder.findOne({ spaceId: context.params.spaceid, folderId: folderId })
                while (folder) {
                    extra++;
                    folderId = camelize(`${data.name}${extra}`)
                    folder = await collections.folder.findOne({ spaceId: context.params.spaceid, folderId: folderId })
                }

                const created = await collections.folder.create({
                    spaceId: context.params.spaceid,
                    folderId,
                    name: data.name,
                    contentTypes: []
                })



                return returnJSON<PostFolderResponse>(created!, PostFolderResponseSchema)
            })
        })
    })
}

export const POST_DOC: generateRouteInfoParams = {
    tags: ["content folder"],
    path: "/space/:spaceid/folder",
    method: "post",
    summary: "Create content folder",
    requiresAuth: "user-jwt-token",
    params: ["spaceid"],
    requestSchema: PostFolderRequestSchema,
    responseSchema: PostFolderResponseSchema,
    responseDescription: "Folder created",
    errors: {

    }
}