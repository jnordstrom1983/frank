import { returnJSON, returnNotFound, withRequestBody, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { SpaceLinkSchema } from "@/models/space"
import { WebhookSchema } from "@/models/webhook"
import { z } from "zod"

const PutLinkItemRequestSchema = SpaceLinkSchema.omit({
    linkId : true
})
export type PutLinkkItemRequest = z.infer<typeof PutLinkItemRequestSchema>

const PutLinkItemResponseSchema = SpaceLinkSchema

export type PutLinkItemResponse = z.infer<typeof PutLinkItemResponseSchema>

export async function PUT(req: Request, context: { params: { spaceid: string; linkid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "owner", async (role) => {
            return await withRequestBody(req, PutLinkItemRequestSchema, async (data) => {

                const space = await collections.space.findOne({ spaceId : context.params.spaceid});
                if(!space){
                    return returnNotFound("Space not found")
                }
                let index = space.links.findIndex(l=>l.linkId===context.params.linkid)
                if(index === -1){
                    return returnNotFound("Link not found");
                }
                space.links[index] = {...space.links[index], ...data}
                await collections.space.updateOne(
                    {
                        spaceId: context.params.spaceid,
                     
                    },
                    {
                        $set: { links : space.links },
                    }
                )

                return returnJSON<PutLinkItemResponse>(space.links[index] , PutLinkItemResponseSchema)
            })
        })
    })
}


export const PUT_DOC: generateRouteInfoParams = {
    tags: ["link"],
    path: "/space/:spaceid/link/:linkid",
    method: "put",
    summary: "Update link",
    requiresAuth: "user-jwt-token",
    params: ["spaceid", "linkid"],
    requestSchema: PutLinkItemRequestSchema,
    responseSchema: PutLinkItemResponseSchema,
    responseDescription: "Update link",
    errors: {
        ERROR_NOTFOUND: "Link not found"
    }
}