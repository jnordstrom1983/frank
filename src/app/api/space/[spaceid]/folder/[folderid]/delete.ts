import { returnJSON, returnNotFound, withRequestBody, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs";
import { z } from "zod"

export async function DELETE(req: Request, context: { params: { spaceid: string; folderid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "any", async (role) => {
            const folder = await collections.folder.findOne({ spaceId: context.params.spaceid, folderId: context.params.folderid })
            if (!folder) {
                return returnNotFound("Folder not found")
            }
            collections.folder.deleteMany({ spaceId: context.params.spaceid, folderId: context.params.folderid })

            collections.content.updateMany(
                {
                    spaceId: context.params.spaceid,
                    folderId: context.params.folderid,
                },
                { $unset: { folderId: true } }
            )

            return returnJSON<{}>({}, z.object({}))
        })
    })
}

export const DELETE_DOC: generateRouteInfoParams = {
    tags: ["content folder"],
    path: "/space/:spaceid/folder/:folderid",
    method: "delete",
    summary: "Delete content folder",
    requiresAuth: "user-jwt-token",
    params: ["spaceid", "folderid"],
    responseSchema: z.object({}),
    responseDescription: "Folder successfully deleted",
    errors: {
        ERROR_NOTFOUND: "Folder not found"
    }
}