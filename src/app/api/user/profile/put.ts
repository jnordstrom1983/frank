import { returnJSON, withRequestBody, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { z } from "zod"

const PutProfileRequestSchema = z.object({
    name: z.string().min(3).optional(),
    lastUsedSpaceId : z.string().optional(),
})

export type PutProfileRequest = z.infer<typeof PutProfileRequestSchema>

const PutProfileResponseSchema = z.object({})
export type PutProfileResponse = z.infer<typeof PutProfileResponseSchema>

export async function PUT(req: Request, context: { params: { spaceid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withRequestBody(req, PutProfileRequestSchema, async (data) => {
            await collections.user.updateOne({ userId: user.userId }, { $set: data })

            return returnJSON<PutProfileResponse>({}, PutProfileResponseSchema)
        })
    })
}

export const PUT_DOC: generateRouteInfoParams = {
    tags: ["user"],
    path: "/user/profile",
    method: "put",
    summary: "Update current user profile",
    requiresAuth: "user-jwt-token",
    params: [],
    requestSchema: PutProfileRequestSchema,
    responseSchema: PutProfileResponseSchema,
    responseDescription: "Profile successfully updated",
    errors: {

    }

}