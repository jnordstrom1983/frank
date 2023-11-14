import { returnJSON, returnNotFound, withRequestBody, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { sendAddedToNewSpace, sendWelcomeNewUserNewSpace } from "@/lib/mail"
import { SpaceUserRoleEnum } from "@/models/spaceuser"
import { v4 as uuidv4 } from "uuid"
import { z } from "zod"

const PostSpaceUserRequestSchema = z.object({
    role: SpaceUserRoleEnum,
    email: z.string().email().toLowerCase(),
})

export type PostSpaceUserRequest = z.infer<typeof PostSpaceUserRequestSchema>

const PostSpaceUserResponseSchema = z.object({ userId: z.string() })

export type PostSpaceUserResponse = z.infer<typeof PostSpaceUserResponseSchema>

export async function POST(req: Request, context: { params: { spaceid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "owner", async (role) => {
            return await withRequestBody(req, PostSpaceUserRequestSchema, async (data) => {
                let created = false;
                let user = await collections.user.findOne({ email: data.email })
                const space = await collections.space.findOne({ spaceId: context.params.spaceid });
                if (!space) {
                    return returnNotFound("Space not found");
                }
                if (!user) {
                    user = await collections.user.create({
                        userId: uuidv4(),
                        email: data.email,
                        role: "user",
                        name: data.email,
                        type: "user",
                        enabled: true,
                    })
                    created = true;
                }
                if (!user) {
                    return returnNotFound("User not found")
                }
                if (!user.enabled) {
                    //Reenable removed user
                    await collections.user.updateOne(
                        { userId: user.userId },
                        {
                            $set: {
                                enabled: true,
                                role: "user",
                            },
                        }
                    )
                }

                await collections.spaceUser.create({
                    userId: user.userId,
                    spaceId: context.params.spaceid,
                    role: data.role,
                    tags : []
                })

                if (created) {
                    sendWelcomeNewUserNewSpace(space.name, data.email)
                } else {
                    sendAddedToNewSpace(space.name, data.email)
                }

                return returnJSON<PostSpaceUserResponse>({ userId: user.userId }, PostSpaceUserResponseSchema)
            })
        })
    })
}



export const POST_DOC: generateRouteInfoParams = {
    tags: ["user"],
    path: "/space/:spaceid/user",
    method: "post",
    summary: "Create user",
    requiresAuth: "user-jwt-token",
    params: ["spaceid"],
    requestSchema: PostSpaceUserRequestSchema,
    responseSchema: PostSpaceUserResponseSchema,
    responseDescription: "User successsafully created",
    errors: {

    }
}