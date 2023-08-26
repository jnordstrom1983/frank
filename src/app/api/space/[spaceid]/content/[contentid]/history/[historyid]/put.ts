import { returnJSON, returnNotFound, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { HistoryItemSchema } from "@/models/history"
import { z } from "zod"

const PutHistoryItemResponseSchema = z.object({})

export type PutHistoryItemResponse = z.infer<typeof PutHistoryItemResponseSchema>

export async function PUT(req: Request, context: { params: { spaceid: string; contentid: string; historyid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "any", async (role) => {
            const item = await collections.history.findOne({ contentId: context.params.contentid, historyId: context.params.historyid })
            if (!item) {
                return returnNotFound("History item not found")
            }

            await collections.contentData.deleteMany({ contentId: context.params.contentid })
            for (let data of item.datas) {
                await collections.contentData.create(data)
            }

            await collections.content.updateOne(
                { contentId: item.contentId },
                {
                    $set: { activeHistoryId: item.historyId },
                },

            )

            return returnJSON<PutHistoryItemResponse>({}, PutHistoryItemResponseSchema)
        })
    })
}


export const PUT_DOC: generateRouteInfoParams = {
    tags: ["content"],
    path: "/space/:spaceid/content/:contentid/history/:historyid",
    method: "put",
    summary: "Restore content revision",
    requiresAuth: "user-jwt-token",
    params: ["spaceid", "contentid", "historyid"],
    requestSchema: z.object({}),
    responseSchema: PutHistoryItemResponseSchema,
    responseDescription: "Content revision successfully restored",
    errors: {
        ERROR_NOTFOUND: "History item not found"
    }
}