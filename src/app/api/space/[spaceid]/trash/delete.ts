import { returnJSON, returnNotFound, withRequestBody, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { camelize } from "@/lib/utils"
import { FolderSchema } from "@/models/folder"
import { z } from "zod"




const DeleteTrashResponseSchema = z.object({})

export type DeleteTrashResponse = z.infer<typeof DeleteTrashResponseSchema>

export async function DELETE(req: Request, context: { params: { spaceid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "owner", async (role) => {
            

                await collections.trash.deleteMany({spaceId : context.params.spaceid})

                return returnJSON<DeleteTrashResponse>({}, DeleteTrashResponseSchema)
            
        })
    })
}

export const DELETE_DOC: generateRouteInfoParams = {
    tags: ["trash"],
    path: "/space/:spaceid/trash",
    method: "delete",
    summary: "Empty trash",
    requiresAuth: "user-jwt-token",
    params: ["spaceid"],
    responseSchema: DeleteTrashResponseSchema,
    responseDescription: "Trash emptied",
    errors: {

    }
}