import { returnJSON, returnNotFound, withSpaceRole, withUser } from "@/lib/apiUtils"
import { dbCollection } from "@/lib/constants"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { ContentSchema } from "@/models/content"
import { ContentDataSchema } from "@/models/contentdata"
import { z } from "zod"

const GetContentItemHistoryItemsSchema = z.object({
    historyId: z.string(),
    date: z.date(),
    changes: z.number(),
    revision: z.number(),
    userId: z.string(),
    userName: z.string(),
})
export type GetContentItemHistoryItems = z.infer<typeof GetContentItemHistoryItemsSchema>

const GetContentItemResponseSchema = z.object({
    content: ContentSchema,
    contentData: z.array(ContentDataSchema),
    historyItems: z.array(GetContentItemHistoryItemsSchema),
})

export type GetContentItemResponse = z.infer<typeof GetContentItemResponseSchema>

export async function GET(req: Request, context: { params: { spaceid: string; contentid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "any", async (role) => {
            const content = await collections.content.findOne({ contentId: context.params.contentid, spaceId: context.params.spaceid })
            if (!content) {
                return returnNotFound("Content not found")
            }

            const contentData = await collections.contentData.findMany({ contentId: context.params.contentid })

            const historyItems = await collections.history.aggregate<GetContentItemHistoryItems>([
                {
                    $match: {
                        contentId: context.params.contentid,
                    },
                },
                {
                    $lookup: {
                        from: dbCollection.user,
                        localField: "userId",
                        foreignField: "userId",

                        as: "users",
                    },
                },

                {
                    $project: {
                        historyId: 1,
                        date: 1,
                        changes: { $size: "$changes" },
                        userId: 1,
                        revision: 1,
                        user: { $arrayElemAt: ["$users", 0] },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        historyId: 1,
                        date: 1,
                        changes: 1,
                        userId: 1,
                        revision: 1,
                        userName: "$user.name",
                    },
                },
                {
                    $sort: { date: -1 },
                },
            ])

            return returnJSON<GetContentItemResponse>(
                {
                    content,
                    contentData,
                    historyItems,
                },
                GetContentItemResponseSchema
            )
        })
    })
}


export const GET_DOC: generateRouteInfoParams = {
    tags: ["content"],
    path: "/space/:spaceid/content/:contentid",
    method: "get",
    summary: "Get content",
    requiresAuth: "user-jwt-token",
    params: ["spaceid", "contentid"],
    responseSchema: GetContentItemResponseSchema,
    responseDescription: "Content successfully deleted",
    errors: {
        ERROR_NOTFOUND: "Content not found"
    }
}