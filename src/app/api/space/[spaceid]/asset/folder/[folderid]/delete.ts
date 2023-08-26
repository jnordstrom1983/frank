import { returnJSON, returnNotFound, withRequestBody, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs";
import { z } from "zod"

export async function DELETE(req: Request, context: { params: { spaceid: string; folderid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "owner", async (role) => {
            const folder = await collections.assetFolder.findOne({ spaceId: context.params.spaceid, folderId: context.params.folderid })
            if (!folder) {
                return returnNotFound("Folder not found")
            }
            collections.assetFolder.deleteMany({ spaceId: context.params.spaceid, folderId: context.params.folderid })

            collections.asset.updateMany(
                {
                    spaceId: context.params.spaceid,
                    assetFolderId: context.params.folderid,
                },
                { $unset: { assetFolderId: true } }
            )

            return returnJSON<{}>({}, z.object({}))
        })
    })
}

export const DELETE_DOC: generateRouteInfoParams = {
    tags: ["asset folder"],
    path: "/space/:spaceid/asset/folder/:folderid",
    method: "delete",
    summary: "Delete asset folder",
    requiresAuth: "user-jwt-token",
    params: ["spaceid", "folderid"],
    responseSchema: z.object({}),
    responseDescription: "Folder successfully deleted",
    errors: {
        ERROR_NOTFOUND: "Folder not found"
    }
}
