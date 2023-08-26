import { returnConflict, returnJSON, withRequestBody, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { UserRoleEnum } from "@/models/user"
import { z } from "zod"

export const PutUserItemResponseSchema = z.object({})
export const PutUserItemRequestSchema = z.object({
    name: z.string().min(3),
    email: z.string().email().toLowerCase(),
    role: UserRoleEnum,
    enabled: z.boolean(),
})

export type PutUserItemResponse = z.infer<typeof PutUserItemResponseSchema>
export type PutUserItemRequest = z.infer<typeof PutUserItemRequestSchema>

export async function PUT(req: Request, context: { params: { userid: string } }) {
    return await withUser(req, "admin", async (user) => {
        return await withRequestBody(req, PutUserItemRequestSchema, async (data) => {
            const existing = await collections.user.findOne({ email: data.email, userId: { $ne: context.params.userid } })
            if (existing) {
                return returnConflict(`User with email ${data.email} already exists`)
            }

            collections.user.updateOne({ userId: context.params.userid }, { $set: data })

            return returnJSON<PutUserItemResponse>({}, PutUserItemResponseSchema)
        })
    })
}

export const PUT_DOC: generateRouteInfoParams = {
    tags: ["user"],
    path: "/user/:userid",
    method: "put",
    summary: "Update a Charlee users",
    requiresAuth: "user-jwt-token",
    params: ["userid"],
    requestSchema: PutUserItemRequestSchema,
    responseSchema: PutUserItemResponseSchema,
    responseDescription: "User updated",
    errors: {
        ERROR_CONFLICT: `User with email [email] already exists`
    }

}
