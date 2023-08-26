import { returnJSON, returnNotFound, withRequestBody, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { SpaceUserRoleEnum } from "@/models/spaceuser"
import { v4 as uuidv4 } from "uuid"
import { z } from "zod"

const PostSpaceApiUserRequestSchema = z.object({
    role: SpaceUserRoleEnum,
    name: z.string().min(3),
})

export type PostSpaceApiUserRequest = z.infer<typeof PostSpaceApiUserRequestSchema>

const PostSpaceApiUserResponseSchema = z.object({ userId: z.string() })

export type PostSpaceApiUserResponse = z.infer<typeof PostSpaceApiUserResponseSchema>

export async function POST(req: Request, context: { params: { spaceid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "owner", async (role) => {
            return await withRequestBody(req, PostSpaceApiUserRequestSchema, async (data) => {
                const user = await collections.user.create({
                    userId: uuidv4(),
                    email: "api-user",
                    role: "user",
                    name: data.name,
                    type: "key",
                    enabled: true,
                })

                if (!user) {
                    return returnNotFound("User not found")
                }

                await collections.spaceUser.create({
                    userId: user.userId,
                    spaceId: context.params.spaceid,
                    role: data.role,
                })

                return returnJSON<PostSpaceApiUserResponse>({ userId: user.userId }, PostSpaceApiUserResponseSchema)
            })
        })
    })
}

export const POST_DOC: generateRouteInfoParams = {
    tags: ["api key"],
    path: "/space/:spaceid/user/api",
    method: "post",
    summary: "Create api key",
    requiresAuth: "user-jwt-token",
    params: ["spaceid"],
    requestSchema: PostSpaceApiUserRequestSchema,
    responseSchema: PostSpaceApiUserResponseSchema,
    responseDescription: "Api key created",
    errors: {

    }
}