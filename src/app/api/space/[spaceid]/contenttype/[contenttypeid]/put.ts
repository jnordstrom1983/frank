import { returnJSON, returnNotFound, withRequestBody, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { ContentTypeSchema } from "@/models/contentype"
import { z } from "zod"

const PutContentTypeItemRequestSchema = ContentTypeSchema.pick({
    name: true,
    enabled: true,
    fields: true,
    generateSlug : true,
    hidden : true
})

export type PutContentTypeItemRequest = z.infer<typeof PutContentTypeItemRequestSchema>

const PutContentTypeItemResponseSchema = z.object({})
export type PutContentTypeItemResponse = z.infer<typeof PutContentTypeItemResponseSchema>


export async function PUT(req: Request, context: { params: { spaceid: string, contenttypeid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "owner", async (role) => {
            return await withRequestBody(req, PutContentTypeItemRequestSchema, async (data) => {
                const contentType = await collections.contentType.findOne({ contentTypeId: context.params.contenttypeid, spaceId: context.params.spaceid })
                if (!contentType) {
                    return returnNotFound("Content Type not found");
                }
                await collections.contentType.updateOne({ contentTypeId: context.params.contenttypeid, spaceId: context.params.spaceid }, { $set: { ...data } })
                return returnJSON<PutContentTypeItemResponse>({}, PutContentTypeItemResponseSchema)
            })
        })
    })
}

export const PUT_DOC: generateRouteInfoParams = {
    tags: ["contenttype"],
    path: "/space/:spaceid/contenttype/:contenttypeid",
    method: "put",
    summary: "Update content type",
    requiresAuth: "user-jwt-token",
    params: ["spaceid", "contenttypeid"],
    requestSchema: PutContentTypeItemRequestSchema,
    responseSchema: PutContentTypeItemResponseSchema,
    responseDescription: "Content type",
    errors: {
        ERROR_NOTFOUND: "Content Type not found"

    }
}