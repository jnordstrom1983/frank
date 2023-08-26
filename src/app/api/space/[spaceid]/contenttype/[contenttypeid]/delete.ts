import { returnInvalidData, returnJSON, returnNotFound, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { ContentTypeSchema } from "@/models/contentype"
import { z } from "zod"


const DeleteContentTypeItemResponseSchema = z.object({})


export type DeleteContentTypeItemResponse = z.infer<typeof DeleteContentTypeItemResponseSchema>

export async function DELETE(req: Request, context: { params: { spaceid: string, contenttypeid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "any", async (role) => {
            const contentType = await collections.contentType.findOne({ contentTypeId: context.params.contenttypeid, spaceId: context.params.spaceid })
            if (!contentType) {
                return returnNotFound("Content Type not found");
            }
            
            const existingContent = await collections.content.findOne({ spaceId : context.params.spaceid, contentTypeId : contentType.contentTypeId});

            if(existingContent){
                return returnInvalidData("Content Type is used and cannot be deleted")
            }

            await collections.contentType.deleteMany({ contentTypeId: context.params.contenttypeid, spaceId: context.params.spaceid })

            return returnJSON<DeleteContentTypeItemResponse>({ }, DeleteContentTypeItemResponseSchema)


        })
    })

}


export const DELETE_DOC: generateRouteInfoParams = {
    tags: ["contenttype"],
    path: "/space/:spaceid/contenttype/:contenttypeid",
    method: "delete",
    summary: "Delete content type",
    requiresAuth: "user-jwt-token",
    params: ["spaceid", "contenttypeid"],
    responseSchema: DeleteContentTypeItemResponseSchema,
    responseDescription: "Content type",
    errors: {
        ERROR_NOTFOUND: "Content Type not found",

    }
}