import { returnJSON, returnNotFound, withSpaceRole, withUser } from "@/lib/apiUtils";
import { collections } from "@/lib/db";
import { generateRouteInfoParams } from "@/lib/docs";
import { z } from "zod";

export async function DELETE(req: Request, context: { params: { spaceid: string; linkid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "owner", async (role) => {

            const space = await collections.space.findOne({ spaceId : context.params.spaceid});
            if(!space){
                return returnNotFound("Space not found")
            }
            let updatedLinks = space.links.filter(l=>l.linkId !== context.params.linkid)
            collections.space.updateOne({ spaceId : context.params.spaceid}, { $set : { links : updatedLinks }})

            return returnJSON<{}>({}, z.object({}))
        })
    })
}


export const DELETE_DOC: generateRouteInfoParams = {
    tags: ["link"],
    path: "/space/:spaceid/link/:linkid",
    method: "delete",
    summary: "Delete a link",
    requiresAuth: "user-jwt-token",
    params: ["spaceid", "linkid"],
    responseSchema: z.object({}),
    responseDescription: "Delete link",
    errors: {
        ERROR_NOTFOUND: "Link not found"
    }
}