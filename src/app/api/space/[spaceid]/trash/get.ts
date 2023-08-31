import { returnJSON, returnNotFound, withSpaceRole, withUser } from "@/lib/apiUtils"
import { dbCollection } from "@/lib/constants"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { ContentData } from "@/models/contentdata"
import { Field } from "@/models/field"
import { FolderSchema } from "@/models/folder"
import { TrashItemSchema } from "@/models/trash"
import { User } from "@/models/user"
import { z } from "zod"





const GetTrashResponseItemSchema = TrashItemSchema.pick({
    contentId : true,
    contentTypeId : true,
    deletedUserId : true,
    deleted : true
}).extend({
    title : z.string(),
    contentType : z.string(),
    deletedUserName : z.string(),
})

const GetTrashResponseSchema = z.object({items : z.array(GetTrashResponseItemSchema)})


export type GetTrashResponse = z.infer<typeof GetTrashResponseSchema>
export type GetTrashResponseItem = z.infer<typeof GetTrashResponseItemSchema>

export async function GET(req: Request, context: { params: { spaceid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "any", async (role) => {
           
            const space = await collections.space.findOne({ spaceId : context.params.spaceid})
            if(!space){
                return returnNotFound("Space not found")
            }

            const trashitems = await collections.trash.aggregate<{
                _id : string,
                contentId : string,
                contentTypeId : string,
                contentType : string,
                contentTypeFields : Field[]
                deletedUserName : string,
                deletedUserId : string,
                datas : ContentData[],
                deleted : Date

            }>([
                {
                     $match : {spaceId : context.params.spaceid}
                },
                {
                    $lookup: {
                        from: dbCollection.user,
                        localField: "deletedUserId",
                        foreignField: "userId",
                        as: "users",
                    },
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
                    $project: {
                        contentId: 1,
                        contentTypeId: 1,
                        contentType: { $arrayElemAt: ["$contentTypes", 0] },
                        user: { $arrayElemAt: ["$users", 0] },
                        datas: 1,
                        deleted : 1,                
                    },
                },   
                {
                    $project: {
                        contentId: 1,
                        contentTypeId: 1,
                        contentType: "$contentType.name",
                        contentTypeFields: "$contentType.fields",
                        folderName: "$folder.name",
                        deletedUserName: "$user.name",
                        deletedUserId: "$user.userId",
                        datas: 1,
                        deleted : 1,
                    },
                },                
                {
                    $sort : {
                        deleted : -1
                    }
                }             
                
            ])
            
            const items = trashitems.map(i => {
                const {_id, datas,contentTypeFields,  ...rest} = i;
                let title = "(Unknown)";


                const titleField = contentTypeFields.find((p) => p.title)
                if (titleField && datas && datas.length > 0) {
                    const data = datas.find((p) => p.languageId === space.defaultLanguage) || datas[0]
                    //@ts-ignore
                    title = getTitleMaxLength(data.data[titleField.fieldId] || title)
                }


                return {
                    title,
                    ...rest
                }
            })



            return returnJSON<GetTrashResponse>({items}, GetTrashResponseSchema )
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
    tags: ["trash"],
    path: "/space/:spaceid/trash",
    method: "get",
    summary: "List deleted content",
    requiresAuth: "user-jwt-token",
    params: ["spaceid"],
    responseSchema: GetTrashResponseSchema,
    responseDescription: "List of deleted content",
    errors: {

    }
}