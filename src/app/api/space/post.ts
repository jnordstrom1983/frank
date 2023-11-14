import { returnJSON, withRequestBody, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { SpaceLanguageEnum, SpaceSchema } from "@/models/space"
import { v4 as uuidv4 } from "uuid"
import { z } from "zod"
import short from "short-uuid"
import { generateRouteInfoParams } from "@/lib/docs"
const PostSpaceRequestSchema = z.object({
    name: z.string().min(3),
    language: SpaceLanguageEnum,
})

const PostSpaceResponseSchema = z.object({
    space: SpaceSchema,
})

export type PostSpaceResponse = z.infer<typeof PostSpaceResponseSchema>
export type PostSpaceRequest = z.infer<typeof PostSpaceRequestSchema>

export async function POST(req: Request) {
    return await withUser(req, "any", async (user) => {
        return await withRequestBody(req, PostSpaceRequestSchema, async (data) => {
            let id = short.generate()
            let existing = await collections.space.findOne({ spaceId: id })
            while (existing) {
                id = short.generate()
                existing = await collections.space.findOne({ spaceId: id })
            }

            const space = await collections.space.create({
                spaceId: id,
                enabled: true,
                creatorUserId: user.userId,
                name: data.name,
                defaultLanguage: data.language,
                contentAccess: "open",
                modules : [],
                links : [],
                userFeatures : ["content", "asset"]
            })

            await collections.spaceUser.create({
                spaceId: space!.spaceId,
                userId: user.userId,
                role: "owner",
                tags : []
            })

            return returnJSON<z.infer<typeof PostSpaceResponseSchema>>({ space: space! }, PostSpaceResponseSchema)
        })
    })
}



export const POST_DOC: generateRouteInfoParams = {
    tags: ["space"],
    path: "/space",
    method: "post",
    summary: "Create space",
    requiresAuth: "user-jwt-token",
    params: [],
    requestSchema: PostSpaceRequestSchema,
    responseSchema: PostSpaceResponseSchema,
    responseDescription: "Space created",
    errors: {

    }
}