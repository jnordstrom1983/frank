import { returnJSON, withRequestBody, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { ContentTypeSchema } from "@/models/contentype"
import { z } from "zod"


const GetContentTypeResponseItemSchema = ContentTypeSchema.pick({
    contentTypeId: true,
    name: true,
    enabled: true,
})

export type GetContentTypeResponseItem = z.infer<typeof GetContentTypeResponseItemSchema>

const GetContentTypeResponseSchema = z.object({
    contenttypes: GetContentTypeResponseItemSchema.array()
})

export type GetContentTypeResponse = z.infer<typeof GetContentTypeResponseSchema>

export async function GET(req: Request, context: { params: { spaceid: string } }) {


    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "any", async (role) => {
            const contenttypes = await collections.contentType.aggregate<GetContentTypeResponseItem>([
                {
                    $match: {
                        spaceId: context.params.spaceid
                    }
                },
                {
                    $project: {
                        contentTypeId: 1,
                        name: 1,
                        enabled: 1
                    }
                },
                {
                    $sort: {
                        enabled: -1,
                        name: 1
                    }
                }
            ])
            return returnJSON<GetContentTypeResponse>({ contenttypes }, GetContentTypeResponseSchema)
        })

    })
}


export const GET_DOC: generateRouteInfoParams = {
    tags: ["contenttype"],
    path: "/space/:spaceid/contenttype",
    method: "get",
    summary: "List content types",
    requiresAuth: "user-jwt-token",
    params: ["spaceid"],
    responseSchema: GetContentTypeResponseSchema,
    responseDescription: "List of content types",
    errors: {

    }
}