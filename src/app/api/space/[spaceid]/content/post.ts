import { returnJSON, returnNotFound, withRequestBody, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { Content, ContentSchema } from "@/models/content"
import { ContentTypeSchema } from "@/models/contentype"
import short from "short-uuid"
import { z } from "zod"

const GetContentTypeItemResponseSchema = ContentTypeSchema.extend({})

const PostContentRequestSchema = ContentSchema.pick({
    contentTypeId: true,
    folderId: true,
    managedByModule: true,
}).extend({
    contentId : z.string().optional()
})

export type PostContentRequest = z.infer<typeof PostContentRequestSchema>

export async function POST(req: Request, context: { params: { spaceid: string; contenttypeid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "any", async (role) => {
            return await withRequestBody(req, PostContentRequestSchema, async (data) => {
                const contentType = await collections.contentType.findOne({ contentTypeId: data.contentTypeId, spaceId: context.params.spaceid })
                if (!contentType) {
                    return returnNotFound("Content Type not found")
                }
                let id = data.contentId ?? short.generate()
                let existing = await collections.content.findOne({ contentId: id })
                while (existing) {
                    id = short.generate()
                    existing = await collections.content.findOne({ contentId: id })
                }

                let content: Content = {
                    contentId: id,
                    contentTypeId: data.contentTypeId,
                    spaceId: context.params.spaceid,
                    createdUserId: user.userId,
                    createdDate: new Date(),
                    modifiedUserId: user.userId,
                    modifiedDate: new Date(),
                    status: "new",
                }
                if (data.folderId) {
                    const folder = await collections.folder.findOne({ spaceId: context.params.spaceid, folderId: data.folderId })
                    if (!folder) {
                        return returnNotFound("Folder not found")
                    }
                    //TODO: Validate if content type is allowed in folder
                    content = { ...content, folderId: data.folderId }
                }
                if (data.managedByModule){
                    content = { ...content, managedByModule: data.managedByModule }
                }   
                const inserted = await collections.content.create(content)

                return returnJSON<Content>(inserted!, ContentSchema)
            })
        })
    })
}


export const POST_DOC: generateRouteInfoParams = {
    tags: ["content"],
    path: "/space/:spaceid/content",
    method: "post",
    summary: "Create new content",
    requiresAuth: "user-jwt-token",
    params: ["spaceid"],
    requestSchema: PostContentRequestSchema,
    responseSchema: ContentSchema,
    responseDescription: "List of content",
    errors: {
        ERROR_NOTFOUND: "Content type not found"
    }
}