import { returnJSON, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { AssetFolderSchema } from "@/models/assetfolder"
import { z } from "zod"

const GetAssetFolderResponseSchema = z.object({
    folders: z.array(AssetFolderSchema)
})

export type GetAssetFolderResponse = z.infer<typeof GetAssetFolderResponseSchema>

export async function GET(req: Request, context: { params: { spaceid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "any", async (role) => {
            const folders = await collections.assetFolder.findMany({ spaceId: context.params.spaceid })

            const responseItem: GetAssetFolderResponse = {
                folders
            }
            return returnJSON<GetAssetFolderResponse>(responseItem, GetAssetFolderResponseSchema)
        })
    })
}

export const GET_DOC: generateRouteInfoParams = {
    tags: ["asset folder"],
    path: "/space/:spaceid/asset/folder",
    method: "get",
    summary: "List asset folders",
    requiresAuth: "user-jwt-token",
    params: ["spaceid"],
    responseSchema: GetAssetFolderResponseSchema,
    responseDescription: "List of folders",
    errors: {

    }
}