import { returnJSON, returnNotFound, withSpaceRole, withUser } from "@/lib/apiUtils";
import { collections } from "@/lib/db";
import { generateRouteInfoParams } from "@/lib/docs";
import { z } from "zod";

export async function DELETE(req: Request, context: { params: { spaceid: string; keyid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "owner", async (role) => {
            const accessKey = await collections.accessKey.findOne({ spaceId: context.params.spaceid, keyId: context.params.keyid })
            if (!accessKey) {
                return returnNotFound("Accesskey not found")
            }
            collections.accessKey.deleteMany({ spaceId: context.params.spaceid, keyId: context.params.keyid })

            return returnJSON<{}>({}, z.object({}))
        })
    })
}

export const DELETE_DOC: generateRouteInfoParams = {
    tags: ["accesskey"],
    path: "/space/:spaceid/accesskey/:keyid",
    method: "delete",
    summary: "Delete access key",
    requiresAuth: "user-jwt-token",
    params: ["spaceid", "keyid"],
    responseSchema: z.object({}),
    responseDescription: "Access key successfully deleted",
    errors: {

    }

}