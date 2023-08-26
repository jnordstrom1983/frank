import { returnConflict, returnJSON, withRequestBody, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { sendWelcomeNewUser } from "@/lib/mail"
import { UserRoleEnum } from "@/models/user"
import { v4 as uuidv4 } from "uuid"
import { z } from "zod"

export const PostUserResponseSchema = z.object({
    userId: z.string(),
})
export const PostUserRequestSchema = z.object({
    name: z.string().min(3),
    email: z.string().email().toLowerCase(),
    role: UserRoleEnum,
})

export type PostUserResponse = z.infer<typeof PostUserResponseSchema>
export type PostUserRequest = z.infer<typeof PostUserRequestSchema>

export async function POST(req: Request) {
    return await withUser(req, "admin", async (user) => {
        return await withRequestBody(req, PostUserRequestSchema, async (data) => {
            const existing = await collections.user.findOne({ email: data.email })
            if (existing) {
                return returnConflict(`User with email ${data.email} already exists`)
            }

            const created = await collections.user.create({
                ...data,
                userId: uuidv4(),
                enabled: true,
                type: "user",
            })

            await sendWelcomeNewUser(data.email);
            return returnJSON<PostUserResponse>({ userId: created!.userId }, PostUserResponseSchema)
        })
    })
}

export const POST_DOC: generateRouteInfoParams = {
    tags: ["user"],
    path: "/user",
    method: "post",
    summary: "Create a new Charlee users",
    requiresAuth: "user-jwt-token",
    params: [],
    requestSchema: PostUserRequestSchema,
    responseSchema: PostUserResponseSchema,
    responseDescription: "User created",
    errors: {}

}
