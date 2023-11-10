import { returnJSON, returnNotFound, withRequestBody, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { SpaceLink, SpaceLinkSchema } from "@/models/space"
import { Webhook, WebhookSchema } from "@/models/webhook"
import shortUUID from "short-uuid"
import { z } from "zod"

const PostLinkRequestSchema = SpaceLinkSchema.omit({
    linkId : true
})

export type PostLinkRequest = z.infer<typeof PostLinkRequestSchema>

const PostLinkResponseSchema = SpaceLinkSchema

export type PostLinkResponse = z.infer<typeof PostLinkResponseSchema>

export async function POST(req: Request, context: { params: { spaceid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "owner", async (role) => {
            return await withRequestBody(req, PostLinkRequestSchema, async (data) => {
                
                const space = await collections.space.findOne({ spaceId : context.params.spaceid});
                if(!space){
                    return returnNotFound("Space not found")
                }

                const link: SpaceLink = {
                    ...data,
                    linkId: shortUUID().generate(),
                }
                await collections.space.updateOne({spaceId : context.params.spaceid}, { $set : { links : [...space.links, link]} })
                
                return returnJSON<PostLinkResponse>(link, PostLinkResponseSchema)
            })
        })
    })
}


export const POST_DOC: generateRouteInfoParams = {
    tags: ["link"],
    path: "/space/:spaceid/link",
    method: "post",
    summary: "Create link",
    requiresAuth: "user-jwt-token",
    params: ["spaceid"],
    requestSchema: PostLinkRequestSchema,
    responseSchema: PostLinkResponseSchema,
    responseDescription: "Link created",
    errors: {

    }
}
