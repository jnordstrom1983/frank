import { returnJSON, withRequestBody, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { SpaceUserSchema } from "@/models/spaceuser"
import { z } from "zod"

const PutSpaceApiUserItemRequestSchema = SpaceUserSchema.pick({
    role: true,
}).extend({
    name: z.string().min(3),
})
export type PutSpaceApiUserItemRequest = z.infer<typeof PutSpaceApiUserItemRequestSchema>

const PutSpaceApiUserItemResponseSchema = z.object({})

export type PutSpaceApiUserItemResponse = z.infer<typeof PutSpaceApiUserItemResponseSchema>

export async function PUT(req: Request, context: { params: { spaceid: string; userid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "owner", async (role) => {
            return await withRequestBody(req, PutSpaceApiUserItemRequestSchema, async (data) => {
                const updated = await collections.spaceUser.updateOne(
                    {
                        spaceId: context.params.spaceid,
                        userId: context.params.userid,
                    },
                    {
                        $set: {
                            role: data.role,
                        },
                    }
                )
                await collections.user.updateOne(
                    {
                        userId: context.params.userid,
                    },
                    {
                        $set: {
                            name: data.name,
                        },
                    }
                )

                return returnJSON<PutSpaceApiUserItemResponse>({}, PutSpaceApiUserItemResponseSchema)
            })
        })
    })
}



export const PUT_DOC: generateRouteInfoParams = {
    tags: ["api key"],
    path: "/space/:spaceid/user/api/:userid",
    method: "put",
    summary: "Update api key",
    requiresAuth: "user-jwt-token",
    params: ["spaceid", "userid"],
    requestSchema: PutSpaceApiUserItemRequestSchema,
    responseSchema: PutSpaceApiUserItemResponseSchema,
    responseDescription: "Update api key",
    errors: {
        ERROR_NOTFOUND: "User not found"
    }
}