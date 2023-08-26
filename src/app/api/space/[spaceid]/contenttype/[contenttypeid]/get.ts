import { returnJSON, returnNotFound, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { ContentTypeSchema } from "@/models/contentype"
import { z } from "zod"


const GetContentTypeItemResponseSchema = ContentTypeSchema.extend({ used : z.boolean() })

export type GetContentTypeItemResponse = z.infer<typeof GetContentTypeItemResponseSchema>

export async function GET(req: Request, context: { params: { spaceid: string, contenttypeid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "any", async (role) => {
            const contentType = await collections.contentType.findOne({ contentTypeId: context.params.contenttypeid, spaceId: context.params.spaceid })
            if (!contentType) {
                return returnNotFound("Content Type not found");
            }
                const existingContent = await collections.content.findOne({ spaceId : context.params.spaceid, contentTypeId : contentType.contentTypeId});
            

            return returnJSON<GetContentTypeItemResponse>({ ...contentType, used : !!existingContent}, GetContentTypeItemResponseSchema)


        })
    })

}


export const GET_DOC: generateRouteInfoParams = {
    tags: ["contenttype"],
    path: "/space/:spaceid/contenttype/:contenttypeid",
    method: "get",
    summary: "Get content type",
    requiresAuth: "user-jwt-token",
    params: ["spaceid", "contenttypeid"],
    responseSchema: GetContentTypeItemResponseSchema,
    responseDescription: "Content type",
    errors: {
        ERROR_NOTFOUND: "Content Type not found"

    }
}