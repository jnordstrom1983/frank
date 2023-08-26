import { returnJSON, withSpaceRole, withUser } from "@/lib/apiUtils";
import { collections } from "@/lib/db";
import { generateRouteInfoParams } from "@/lib/docs";
import { z } from "zod";

export async function DELETE(req: Request, context: { params: { spaceid: string; userid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "owner", async (role) => {
            await collections.spaceUser.deleteMany({ userId: context.params.userid, spaceId: context.params.spaceid })
            await collections.user.updateOne({ userId: context.params.userid }, { $set: { enabled: false } })
            return returnJSON<{}>({}, z.object({}))
        })
    })
}


export const DELETE_DOC: generateRouteInfoParams = {
    tags: ["api key"],
    path: "/space/:spaceid/user/api/:userid",
    method: "delete",
    summary: "Delete api key",
    requiresAuth: "user-jwt-token",
    params: ["spaceid", "userid"],
    responseSchema: z.object({}),
    responseDescription: "Delete api key",
    errors: {

    }
}