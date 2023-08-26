import { returnJSON, withRequestBody, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { ContentTypeSchema } from "@/models/contentype"
import { z } from "zod"
import { v4 as uuidv4 } from "uuid"
import { camelize, slugify } from "@/lib/utils"
import { generateRouteInfoParams } from "@/lib/docs"

const PostContentTypeRequestSchema = ContentTypeSchema.pick({
    name: true
})
export type PostContentTypeRequest = z.infer<typeof PostContentTypeRequestSchema>


const PostContenTypeResponseSchema = z.object({
    contenttype: ContentTypeSchema
})
export type PostContenTypeResponse = z.infer<typeof PostContenTypeResponseSchema>


export async function POST(req: Request, context: { params: { spaceid: string } }) {


    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "owner", async (role) => {
            return await withRequestBody(req, PostContentTypeRequestSchema, async (data) => {

                let id = camelize(data.name)
                let cnt = 0;
                let existing = await collections.contentType.findOne({ contentTypeId: id, spaceId: context.params.spaceid })
                while (existing) {
                    cnt++;
                    id = `${camelize(data.name)}${cnt}`
                    existing = await collections.contentType.findOne({ contentTypeId: id, spaceId: context.params.spaceid })
                }

                const contenttype = await collections.contentType.create(
                    {
                        contentTypeId: id,
                        spaceId: context.params.spaceid,
                        creatorUserId: user.userId,
                        enabled: true,
                        fields: [],
                        generateSlug : false,
                        ...data,
                    }
                );

                return returnJSON<PostContenTypeResponse>({ contenttype: contenttype! }, PostContenTypeResponseSchema)

            })

        })
    })
}


export const POST_DOC: generateRouteInfoParams = {
    tags: ["contenttype"],
    path: "/space/:spaceid/contenttype",
    method: "post",
    summary: "Create content types",
    requiresAuth: "user-jwt-token",
    params: ["spaceid"],
    requestSchema: PostContentTypeRequestSchema,
    responseSchema: PostContenTypeResponseSchema,
    responseDescription: "Content type created",
    errors: {

    }
}
