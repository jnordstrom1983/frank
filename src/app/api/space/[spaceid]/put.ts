import { returnJSON, returnNotFound, withRequestBody, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { SpaceSchema } from "@/models/space"
import { z } from "zod"
const PutSpaceRequestSchema = SpaceSchema.pick({
    defaultLanguage: true,
    name: true,
    contentAccess: true,
})

const PutSpaceResponseSchema = SpaceSchema

export type PutSpaceResponse = z.infer<typeof PutSpaceRequestSchema>
export type PutSpaceRequest = z.infer<typeof PutSpaceResponseSchema>

export async function PUT(req: Request, context: { params: { spaceid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withRequestBody(req, PutSpaceRequestSchema, async (data) => {
            return await withSpaceRole(user, context.params.spaceid, "owner", async (role) => {
                const space = await collections.space.updateOne({ spaceId: context.params.spaceid }, { $set: data })
                if (!space) {
                    return returnNotFound("Space not found")
                }
                return returnJSON<PutSpaceResponse>(space!, PutSpaceResponseSchema)
            })
        })
    })
}


export const PUT_DOC: generateRouteInfoParams = {
    tags: ["space"],
    path: "/space/:spaceid",
    method: "put",
    summary: "Update space",
    requiresAuth: "user-jwt-token",
    params: ["spaceid"],
    requestSchema: PutSpaceRequestSchema,
    responseSchema: PutSpaceResponseSchema,
    responseDescription: "Update space",
    errors: {
        ERROR_NOTFOUND: "Space not found"
    }
}