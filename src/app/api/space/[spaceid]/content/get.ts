import { returnJSON, returnNotFound, withSpaceRole, withUser } from "@/lib/apiUtils"
import { dbCollection } from "@/lib/constants"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { ContentInternalViewModelSchema, ContentSchema, ContentStatus } from "@/models/content"
import { ContentData, ContentDataSchema } from "@/models/contentdata"
import { Field } from "@/models/field"
import { z } from "zod"

const GetContentResponseSchema = z.object({
    items: z.array(ContentInternalViewModelSchema),
})

interface ItemAggregationResult {
    contentId: string
    contentTypeId: string
    folderId?: string
    createdDate: Date
    modifiedUserId: string
    modifiedDate: Date
    status: ContentStatus
    contentTypeName: string
    contentTypeFields: Field[]
    folderName: string
    modifiedUserName: string
    contentdata: ContentData[]
}

export type GetContentResponse = z.infer<typeof GetContentResponseSchema>

export async function GET(req: Request, context: { params: { spaceid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "any", async (role) => {
            const space = await collections.space.findOne({ spaceId: context.params.spaceid })
            if (!space) {
                return returnNotFound("Space not found")
            }

            const aggregatedData = await collections.content.aggregate<ItemAggregationResult>([
                {
                    $match: { spaceId: context.params.spaceid, status: { $ne: "new" } },
                },
                {
                    $lookup: {
                        from: dbCollection.contentType,
                        localField: "contentTypeId",
                        foreignField: "contentTypeId",

                        as: "contentTypes",
                    },
                },
                {
                    $lookup: {
                        from: dbCollection.folder,
                        localField: "folderId",
                        foreignField: "folderId",
                        as: "folders",
                    },
                },
                {
                    $lookup: {
                        from: dbCollection.user,
                        localField: "modifiedUserId",
                        foreignField: "userId",
                        as: "users",
                    },
                },
                {
                    $lookup: {
                        from: dbCollection.contentData,
                        localField: "contentId",
                        foreignField: "contentId",
                        as: "contentdata",
                    },
                },
                {
                    $project: {
                        contentId: 1,
                        contentTypeId: 1,
                        folderId: 1,
                        createdDate: 1,
                        modifiedUserId: 1,
                        modifiedDate: 1,
                        status: 1,
                        contentType: { $arrayElemAt: ["$contentTypes", 0] },
                        folder: { $arrayElemAt: ["$folders", 0] },
                        user: { $arrayElemAt: ["$users", 0] },
                        contentdata: 1,
                    },
                },
                {
                    $project: {
                        contentId: 1,
                        contentTypeId: 1,
                        folderId: 1,
                        createdDate: 1,
                        modifiedUserId: 1,
                        modifiedDate: 1,
                        status: 1,
                        contentTypeName: "$contentType.name",
                        contentTypeFields: "$contentType.fields",
                        folderName: "$folder.name",
                        modifiedUserName: "$user.name",
                        contentdata: 1,
                    },
                },
                {
                    $sort: {
                        modifiedDate: -1,
                    },
                },
            ])

            //TODO: This must be possible to do in a more efficient way, in aggreation?
            const items = aggregatedData.map((item) => {
                const { contentdata, contentTypeFields, ...rest } = item

                let title = "(Unnamed)"
                const titleField = contentTypeFields.find((p) => p.title)
                if (titleField && contentdata && contentdata.length > 0) {
                    const data = contentdata.find((p) => p.languageId === space.defaultLanguage) || contentdata[0]
                    //@ts-ignore
                    title = getTitleMaxLength(data.data[titleField.fieldId] || title)
                }

                return {
                    title: title,
                    ...rest,
                }
            })

            return returnJSON<GetContentResponse>(
                {
                    items,
                },
                GetContentResponseSchema
            )
        })
    })
}

function getTitleMaxLength(title : string){
    if(title.length > 30){
        return `${title.substring(0, 27)}...`
    }
    return title;
}


export const GET_DOC: generateRouteInfoParams = {
    tags: ["content"],
    path: "/space/:spaceid/content",
    method: "get",
    summary: "List content",
    requiresAuth: "user-jwt-token",
    params: ["spaceid"],
    responseSchema: GetContentResponseSchema,
    responseDescription: "List of content",
    errors: {

    }
}