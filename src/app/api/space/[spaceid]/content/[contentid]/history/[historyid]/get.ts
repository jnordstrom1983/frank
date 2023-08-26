import { returnJSON, returnNotFound, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { HistoryItemSchema } from "@/models/history"
import { z } from "zod"





const GetHistoryItemResponseSchema = HistoryItemSchema.omit({
    datas: true,
}).extend({
    userName: z.string()
})

export type GetHistoryItemResponse = z.infer<typeof GetHistoryItemResponseSchema>

export async function GET(req: Request, context: { params: { spaceid: string; contentid: string; historyid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "any", async (role) => {
            const item = await collections.history.findOne({ contentId: context.params.contentid, historyId: context.params.historyid })
            if (!item) {
                return returnNotFound("History item not found")
            }
            const user = await collections.user.findOne({ userId: item.userId });
            const responseItem: GetHistoryItemResponse = {
                ...item,
                userName: user?.name || "-"
            }
            return returnJSON<GetHistoryItemResponse>(responseItem, GetHistoryItemResponseSchema)
        })
    })
}


export const GET_DOC: generateRouteInfoParams = {
    tags: ["content"],
    path: "/space/:spaceid/content/:contentid/history/:historyid",
    method: "get",
    summary: "Get content revision",
    requiresAuth: "user-jwt-token",
    params: ["spaceid", "contentid", "historyid"],
    responseSchema: GetHistoryItemResponseSchema,
    responseDescription: "Content revision",
    errors: {
        ERROR_NOTFOUND: "History item not found"
    }
}