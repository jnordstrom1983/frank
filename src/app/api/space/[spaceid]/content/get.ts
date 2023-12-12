import { returnJSON, returnNotFound, withSpaceRole, withUser } from "@/lib/apiUtils"
import { dbCollection } from "@/lib/constants"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { ContentInternalViewModelSchema, ContentStatus } from "@/models/content"
import { ContentData } from "@/models/contentdata"
import { SpaceModule } from "@/models/space"
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
    //contentdata: ContentData[],
    managedByModule?: SpaceModule
}

export type GetContentResponse = z.infer<typeof GetContentResponseSchema>

export async function GET(req: Request, context: { params: { spaceid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "any", async (role) => {
            const space = await collections.space.findOne({ spaceId: context.params.spaceid })
            if (!space) {
                return returnNotFound("Space not found")
            }

            const contentTypes = await collections.contentType.findMany({ spaceId: context.params.spaceid })
            const folders = await collections.folder.findMany({ spaceId: context.params.spaceid });
            const users = await collections.user.findMany({});

            //Generate a projection and get only required data
            let contentDatasProjection : any = { contentId : 1, languageId : 1 } 
            contentTypes.forEach(c=>{
                const titleField = c.fields.find(f=>f.title);
                if(titleField){
                    contentDatasProjection[`data.${titleField.fieldId}`] = 1;
                }
            })
            const contentDatas = await collections.contentData.aggregate([ 
                { 
                    $match : { spaceId: context.params.spaceid, languageId : space.defaultLanguage }
                },
                {
                    $project : contentDatasProjection 
                }
            ])
            let contentDatasRecord : Record<string, any> = {};
            contentDatas.forEach(c=>{
                contentDatasRecord[c.contentId] = c
            })           

            const aggregatedData = await collections.content.aggregate<ItemAggregationResult>([
                {
                    $match: { spaceId: context.params.spaceid, status: { $ne: "new" } },
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
                        scheduledPublishDate: 1,
                        scheduledDepublishDate: 1,
                        publishDate: 1,
                        managedByModule: 1,
                    },
                },
                {
                    $sort: {
                        modifiedDate: -1,
                    },
                },
            ])

          

            const items = aggregatedData.map((item) => {
                const {  ...rest } = item
                const contentdata = contentDatasRecord[item.contentId]
                const contentType = contentTypes.find(p => p.contentTypeId === item.contentTypeId)
                const folder = folders.find(p => p.folderId === item.folderId)
                const user = users.find(p => p.userId === item.modifiedUserId)

                let title = "(Unnamed)"
                const titleField = contentType?.fields.find((p) => p.title)
                if (titleField && contentdata) {
                    //@ts-ignore
                    title = getTitleMaxLength(contentdata.data[titleField.fieldId] || title)
                }

                return {
                    title: title,
                    contentTypeName: contentType?.name || "-",
                    folderName: folder?.name,
                    modifiedUserName: user?.name || "-",
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

function getTitleMaxLength(title: string) {
    if (title.length > 30) {
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