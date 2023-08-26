import { returnJSON, withRequestBody, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { SpaceUserSchema } from "@/models/spaceuser"
import { z } from "zod"

const PutSpaceUserItemRequestSchema = SpaceUserSchema.pick({
    role: true,
})
export type PutSpaceUserItemRequest = z.infer<typeof PutSpaceUserItemRequestSchema>

const PutSpaceUserItemResponseSchema = z.object({})

export type PutSpaceUserItemResponse = z.infer<typeof PutSpaceUserItemResponseSchema>

export async function PUT(req: Request, context: { params: { spaceid: string; userid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "owner", async (role) => {
            return await withRequestBody(req, PutSpaceUserItemRequestSchema, async (data) => {
                const updated = await collections.spaceUser.updateOne(
                    {
                        spaceId: context.params.spaceid,
                        userId: context.params.userid,
                    },
                    {
                        $set: data,
                    }
                )

                return returnJSON<PutSpaceUserItemResponse>({}, PutSpaceUserItemResponseSchema)
            })
        })
    })
}



export const PUT_DOC: generateRouteInfoParams = {
    tags: ["user"],
    path: "/space/:spaceid/user/:userid",
    method: "put",
    summary: "Update user",
    requiresAuth: "user-jwt-token",
    params: ["spaceid", "userid"],
    requestSchema: PutSpaceUserItemRequestSchema,
    responseSchema: PutSpaceUserItemResponseSchema,
    responseDescription: "User successfully updated",
    errors: {
        ERROR_NOTFOUND: "User not found"
    }
}