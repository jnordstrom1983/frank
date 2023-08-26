import { returnJSON, withSpaceRole, withUser } from "@/lib/apiUtils";
import { collections } from "@/lib/db";
import { generateRouteInfoParams } from "@/lib/docs";
import { z } from "zod";

export async function DELETE(req: Request, context: { params: { spaceid: string; userid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "owner", async (role) => {
            await collections.spaceUser.deleteMany({ userId: context.params.userid, spaceId: context.params.spaceid })

            //If this user do not have any more spaces, and is not an admin, disable the account
            const spaceUsers = await collections.spaceUser.findMany({ userId: context.params.userid })
            if (spaceUsers.length > 0) {
                const user = await collections.user.findOne({ userId: context.params.userid })
                if (user) {
                    if (user.role === "user" && user.enabled) {
                        await collections.user.updateOne({ userId: user.userId }, { $set: { enabled: false } })
                    }
                }
            }
            return returnJSON<{}>({}, z.object({}))
        })
    })
}

export const DELETE_DOC: generateRouteInfoParams = {
    tags: ["user"],
    path: "/space/:spaceid/user/:userid",
    method: "delete",
    summary: "Delete user",
    requiresAuth: "user-jwt-token",
    params: ["spaceid", "userid"],
    responseSchema: z.object({}),
    responseDescription: "User successfully deleted",
    errors: {
        ERROR_NOTFOUND: "User not found"
    }
}