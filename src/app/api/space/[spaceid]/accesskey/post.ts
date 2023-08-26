import { returnJSON, withRequestBody, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { AccessKeySchema } from "@/models/accesskey"
import crypto from "crypto"
import { v4 as uuidv4 } from "uuid"
import { z } from "zod"

const PostAccesskeyRequestSchema = AccessKeySchema.pick({
    name: true,
})

export type PostAccesskeyRequest = z.infer<typeof PostAccesskeyRequestSchema>

const PostAccesskeyResponseSchema = z.object({
    keyId: z.string(),
})

export type PostAccesskeyResponse = z.infer<typeof PostAccesskeyResponseSchema>

export async function POST(req: Request, context: { params: { spaceid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "owner", async (role) => {
            return await withRequestBody(req, PostAccesskeyRequestSchema, async (data) => {
                const key = crypto.randomBytes(20).toString("hex")
                const created = await collections.accessKey.create({
                    keyId: uuidv4(),
                    spaceId: context.params.spaceid,
                    key,
                    name: data.name,
                    contentTypes: [],
                    allContent: true,
                })
                return returnJSON<PostAccesskeyResponse>({ keyId: created!.keyId }, PostAccesskeyResponseSchema)
            })
        })
    })
}

export const POST_DOC: generateRouteInfoParams = {
    tags: ["accesskey"],
    path: "/space/:spaceid/accesskey",
    method: "post",
    summary: "Create access key",
    requiresAuth: "user-jwt-token",
    params: ["spaceid"],
    requestSchema: PostAccesskeyRequestSchema,
    responseSchema: PostAccesskeyResponseSchema,
    responseDescription: "Access key successfully created",
    errors: {

    }

}