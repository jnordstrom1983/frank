import { returnJSON, returnNotFound, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { FolderSchema } from "@/models/folder"
import { z } from "zod"





const GetFolderResponseSchema = z.object({
    folders: z.array(FolderSchema)
})

export type GetFolderResponse = z.infer<typeof GetFolderResponseSchema>

export async function GET(req: Request, context: { params: { spaceid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "any", async (role) => {
            const folders = await collections.folder.findMany({ spaceId: context.params.spaceid })

            const responseItem: GetFolderResponse = {
                folders
            }
            return returnJSON<GetFolderResponse>(responseItem, GetFolderResponseSchema)
        })
    })
}


export const GET_DOC: generateRouteInfoParams = {
    tags: ["content folder"],
    path: "/space/:spaceid/folder",
    method: "get",
    summary: "List content folders",
    requiresAuth: "user-jwt-token",
    params: ["spaceid"],
    responseSchema: GetFolderResponseSchema,
    responseDescription: "List of content folders types",
    errors: {

    }
}