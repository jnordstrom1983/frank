import { returnJSON, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { z } from "zod"

export async function DELETE(req: Request, context: { params: { userid: string } }) {
    return await withUser(req, "admin", async () => {
        await collections.user.updateOne({ userId: context.params.userid }, { $set: { enabled: false } })
        await collections.spaceUser.deleteMany({ userId: context.params.userid })
        return returnJSON<{}>({}, z.object({}))
    })
}



export const DELETE_DOC: generateRouteInfoParams = {
    tags: ["user"],
    path: "/user/:userid",
    method: "delete",
    summary: "Delete a Frank users",
    requiresAuth: "user-jwt-token",
    params: ["userid"],
    responseSchema: z.object({}),
    responseDescription: "User deleted",
    errors: {}

}