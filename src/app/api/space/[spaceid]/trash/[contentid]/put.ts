import { returnJSON, returnNotFound, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { z } from "zod"




const PutTrashItemResponseSchema = z.object({})

export type PutTrashItemResponse = z.infer<typeof PutTrashItemResponseSchema>

export async function PUT(req: Request, context: { params: { spaceid: string, contentid : string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "any", async (role) => {


                 const content = await collections.trash.findOne({ contentId: context.params.contentid, spaceId: context.params.spaceid })
                if (!content) {
                    return returnNotFound("Content not found")
                }

                const {datas, deletedUserId, deleted, ...item}  = content;

                const contentType = await collections.contentType.findOne({ contentTypeId : item.contentTypeId, spaceId : context.params.spaceid});
                if(!contentType){
                    return returnNotFound("ContentType not found, content can't be restored");
                }

                item.status = "draft";
                delete item.publishDate;
                delete item.activeHistoryId;
                
                if(item.folderId){
                    const folder = await collections.folder.findOne({ folderId : item.folderId, spaceId : item.spaceId })
                    if(!folder){
                        delete item.folderId;
                    }
                }
                await collections.content.create(item);

                for(let data of datas){
                    delete data.publishDate;
                    data.status = "draft";
                    await collections.contentData.create(data);
                }

                await collections.trash.deleteMany({spaceId : item.spaceId, contentId : item.contentId})

                

                return returnJSON<PutTrashItemResponse>({}, PutTrashItemResponseSchema)
        
        })
    })
}

export const PUT_DOC: generateRouteInfoParams = {
    tags: ["trash"],
    path: "/space/:spaceid/trash/:contentid",
    method: "put",
    summary: "Restore content",
    requiresAuth: "user-jwt-token",
    params: ["spaceid", "contentid"],
    responseSchema: PutTrashItemResponseSchema,
    responseDescription: "Content restored",
    errors: {
        ERROR_NOTFOUND: "Content not found"
    }
}