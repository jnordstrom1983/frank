import { returnJSON, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { AccessKeySchema } from "@/models/accesskey"
import { z } from "zod"

const GetAccesskeyResponseSchema = z.object({
    keys: z.array(AccessKeySchema.omit({ key: true })),
})

export type GetAccesskeyResponse = z.infer<typeof GetAccesskeyResponseSchema>

export async function GET(req: Request, context: { params: { spaceid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "owner", async (role) => {
            const keys = await collections.accessKey.findMany({ spaceId: context.params.spaceid })

            const responseItem: GetAccesskeyResponse = {
                keys: keys.map((k) => {
                    const { key, ...rest } = k
                    return rest
                }),
            }
            return returnJSON<GetAccesskeyResponse>(responseItem, GetAccesskeyResponseSchema)
        })
    })
}


export const GET_DOC: generateRouteInfoParams = {
    tags: ["accesskey"],
    path: "/space/:spaceid/accesskey",
    method: "get",
    summary: "Get access keys",
    requiresAuth: "user-jwt-token",
    params: ["spaceid"],
    responseSchema: GetAccesskeyResponseSchema,
    responseDescription: "List of access keys",
    errors: {

    }
}