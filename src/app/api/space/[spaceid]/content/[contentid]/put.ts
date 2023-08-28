import { GetFieldValidationErrors } from "@/components/FieldEditors/FieldEditorHelper"
import { returnError, returnJSON, returnNotFound, withRequestBody, withSpaceRole, withUser } from "@/lib/apiUtils"
import { dataTypes } from "@/lib/constants"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { slugify } from "@/lib/utils"
import { processWebhooks } from "@/lib/webhook"
import { ContentSchema } from "@/models/content"
import { ContentData, ContentDataSchema } from "@/models/contentdata"
import { ContentTypeSchema } from "@/models/contentype"
import { HistoryItem, HistoryItemChange } from "@/models/history"
import { SpaceLanguageEnum } from "@/models/space"
import { v4 } from "uuid"
import { z } from "zod"

const GetContentTypeItemResponseSchema = ContentTypeSchema.extend({})

const PutContentItemRequestSchema = ContentSchema.pick({
    status: true,
    folderId: true,
   
    
}).extend({
    data: z.array(
        ContentDataSchema.pick({
            languageId: true,
            data: true,
        }).extend({
            slug : z.string().optional(),
        })
    ),

    scheduledDepublishDate : z.string().datetime( { offset: true } ).pipe( z.coerce.date() ).optional(),
    scheduledPublishDate : z.string().datetime( { offset: true } ).pipe( z.coerce.date() ).optional(),
    
    
})

const PutContentItemErrorItemSchema = z.object({
    fieldId: z.string(),
    languageId: SpaceLanguageEnum,
    message: z.string(),
})
export type PutContentItemErrorItem = z.infer<typeof PutContentItemErrorItemSchema>

const PutContentItemResponseSchema = z.object({})

export type PutContentItemRequest = z.infer<typeof PutContentItemRequestSchema>
export type PutContentItemResponse = z.infer<typeof PutContentItemResponseSchema>

export async function PUT(req: Request, context: { params: { spaceid: string; contentid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "any", async (role) => {
            return await withRequestBody(req, PutContentItemRequestSchema, async (data) => {


                const space = await collections.space.findOne({ spaceId: context.params.spaceid })
                if(!space){
                    return returnNotFound("Space not found");
                }

                const content = await collections.content.findOne({ contentId: context.params.contentid, spaceId: context.params.spaceid })
                if (!content) {
                    return returnNotFound("Content Item not found")
                }

                const contentType = await collections.contentType.findOne({ contentTypeId: content.contentTypeId })
                if (!contentType) {
                    return returnNotFound("Content Type not found")
                }

             
                let errors: PutContentItemErrorItem[] = []
                for (const contentData of data.data) {
                    let assets = [];
                    contentType.fields.forEach((f) => {
                        let data = contentData.data[f.fieldId]
                        if (data === undefined) {
                            const type = dataTypes.find(t => t.id === f.dataTypeId)
                            if (type) {
                                const variant = type.variants.find(v => v.id === f.dataTypeVariantId);
                                if (variant) {
                                    data = variant.defaultValue
                                }
                            }
                        }
                        const validationErrors = GetFieldValidationErrors(f, data)
                        validationErrors?.forEach((error) => {
                            errors.push({
                                languageId: contentData.languageId,
                                fieldId: f.fieldId,
                                message: error,
                            })
                        })

                    })
                }
                if (errors.length > 0) {
                    return returnError({ error: errors, message: "Validation failed", code: 422, status: 422 })
                }


                let historyChanges: HistoryItemChange[] = []

                let processedLanguages = []
                for (const contentData of data.data) {
                    const assetIds: string[] = [];
                    contentType.fields.filter(p => p.dataTypeId === "asset").forEach(f => {
                        const value = contentData.data[f.fieldId];
                        if (value) {
                            if (!assetIds.includes(value)) assetIds.push(value)
                        }
                    })
                    contentType.fields.filter(p => p.dataTypeId === "assetArray").forEach(f => {
                        const value = contentData.data[f.fieldId];
                        if (value) {
                            if (Array.isArray(value)) {
                                value.forEach((v) => {
                                    if (!assetIds.includes(v)) assetIds.push(v)

                                })

                            }
                        }
                    })

                    //Find asset in blocks
                    contentType.fields.filter(p => p.dataTypeId === "blocks").forEach(f => {
                        const value = contentData.data[f.fieldId];
                        if (value) {
                            if (Array.isArray(value)) {
                                value.filter(v => v.type === "asset").forEach(a => {
                                    if (a.data) {
                                        if (!assetIds.includes(a.data)) assetIds.push(a.data)
                                    }
                                })
                            }
                        }
                    })



                    
                    if(contentType.generateSlug && !contentData.slug){


                        let title = "Unnamed"
                        const titleField = contentType.fields.find((p) => p.title)
                        if (titleField) {
                            //@ts-ignore
                            title = contentData.data[titleField.fieldId] || title
                        }
    
                        
    
                        contentData.slug = slugify(title)
    
                    }else if(contentData.slug){
                        contentData.slug = slugify(contentData.slug)
                    }
    

                    if(contentData.slug){
                        let existingSlugContent = await collections.contentData.findOne({ slug : contentData.slug, languageId : contentData.languageId,  spaceId : context.params.spaceid, contentId : { $ne : context.params.contentid } })
                        if(existingSlugContent){
                            
                            let cnt = 0;
                            let newSlug = `${contentData.slug}-${cnt}`
                            while(existingSlugContent){
                                cnt++;
                                newSlug = `${contentData.slug}-${cnt}`
                                existingSlugContent = await collections.contentData.findOne({ slug : newSlug, languageId : contentData.languageId,  spaceId : context.params.spaceid, contentId : { $ne : context.params.contentid } })
                            }
                            contentData.slug = newSlug;
                            
                        }
    
                    }

                    const existingData = await collections.contentData.findOne({ languageId: contentData.languageId, contentId: context.params.contentid })
                    if (existingData) {
                        await collections.contentData.updateOne(
                            { contentDataId: existingData.contentDataId },
                            {
                                $set: {
                                    modifiedUserId: user.userId,
                                    modifiedDate: new Date(),
                                    data: contentData.data,
                                    referencedAssets: assetIds,
                                    status: data.status,
                         
                                    
                                },
                            }
                        )

                        if (data.folderId) {
                            await collections.contentData.updateOne(
                                { contentDataId: existingData.contentDataId },
                                {
                                    $set: {
                                        folderId: data.folderId
                                    },
                                }
                            )
                        } else {
                            await collections.contentData.updateOne(
                                { contentDataId: existingData.contentDataId },
                                {
                                    $unset: {
                                        folderId: true
                                    },
                                }
                            )
                        }



                      


                        if (contentData.slug) {
                            await collections.contentData.updateOne(
                                { contentDataId: existingData.contentDataId },
                                {
                                    $set: {
                                        slug: contentData.slug
                                    },
                                }
                            )
                        } else {
                            await collections.contentData.updateOne(
                                { contentDataId: existingData.contentDataId },
                                {
                                    $unset: {
                                        slug: true
                                    },
                                }
                            )
                        }                        

                       


                        const newKeys = Object.keys(contentData.data)
                        const oldKeys = Object.keys(existingData.data)
                        const keys = [...newKeys, ...oldKeys].filter((value, index, array) => array.indexOf(value) === index)

                        for (let k of keys) {
                            const newValue = contentData.data[k]
                            const oldValue = existingData.data[k]

                            if (newValue !== undefined && oldValue !== undefined) {
                                if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
                                    historyChanges.push({
                                        changeId: v4(),
                                        fieldId: k,
                                        languageId: contentData.languageId,
                                        valueBefore: oldValue,
                                        valueAfter: newValue,
                                        type: "updated",
                                    })
                                }
                            } else {
                                if (newValue !== undefined) {
                                    historyChanges.push({
                                        changeId: v4(),
                                        fieldId: k,
                                        languageId: contentData.languageId,
                                        valueAfter: newValue,
                                        type: "created",
                                    })
                                }
                                if (oldValue !== undefined) {
                                    historyChanges.push({
                                        changeId: v4(),
                                        fieldId: k,
                                        languageId: contentData.languageId,
                                        valueBefore: oldValue,
                                        type: "deleted",
                                    })
                                }
                            }
                        }
                    } else {
                        const contentDataId = v4()
                        await collections.contentData.create({
                            contentDataId: contentDataId,
                            spaceId: context.params.spaceid,
                            contentId: context.params.contentid,
                            contentTypeId: content.contentTypeId,
                            languageId: contentData.languageId,
                            modifiedUserId: user.userId,
                            modifiedDate: new Date(),
                            data: contentData.data,
                            referencedAssets: assetIds,
                            status: data.status,
                        })


                        if (contentData.slug) {
                            await collections.contentData.updateOne(
                                { contentDataId },
                                {
                                    $set: {
                                        slug: contentData.slug
                                    },
                                }
                            )
                        } 
                                     



                        if (data.folderId) {
                            await collections.contentData.updateOne(
                                { contentDataId },
                                {
                                    $set: {
                                        folderId: data.folderId
                                    },
                                }
                            )
                        } else {
                            await collections.contentData.updateOne(
                                { contentDataId },
                                {
                                    $unset: {
                                        folderId: true
                                    },
                                }
                            )
                        }

                        const keys = Object.keys(contentData.data)
                        for (let k of keys) {
                            const value = contentData.data[k]
                            historyChanges.push({
                                changeId: v4(),
                                fieldId: k,
                                languageId: contentData.languageId,
                                valueAfter: value,
                                type: "created",
                            })
                        }
                    }
                    processedLanguages.push(contentData.languageId)
                }

                await collections.contentData.deleteMany({ contentId: context.params.contentid, languageId: { $nin: processedLanguages } })

                await collections.content.updateOne(
                    { contentId: context.params.contentid },
                    {
                        $set: {
                            modifiedUserId: user.userId,
                            modifiedDate: new Date(),
                            status: data.status,
                        },
                    }
                )

              

                if (data.folderId) {
                    await collections.content.updateOne(
                        { contentId: context.params.contentid },
                        {
                            $set: {
                                folderId: data.folderId
                            },
                        }
                    )
                } else {
                    await collections.content.updateOne(
                        { contentId: context.params.contentid },
                        {
                            $unset: {
                                folderId: true
                            },
                        }
                    )
                }

                if (data.scheduledPublishDate) {
                    await collections.content.updateOne(
                        { contentId: context.params.contentid },
                        {
                            $set: {
                                scheduledPublishDate: data.scheduledPublishDate
                            },
                        }
                    )
                } else {
                    await collections.content.updateOne(
                        { contentId: context.params.contentid },
                        {
                            $unset: {
                                scheduledPublishDate: true
                            },
                        }
                    )
                }


                if (data.scheduledDepublishDate) {
                    await collections.content.updateOne(
                        { contentId: context.params.contentid },
                        {
                            $set: {
                                scheduledDepublishDate: data.scheduledDepublishDate
                            },
                        }
                    )
                } else {
                    await collections.content.updateOne(
                        { contentId: context.params.contentid },
                        {
                            $unset: {
                                scheduledDepublishDate: true
                            },
                        }
                    )
                }


                if (historyChanges.length > 0) {
                    const datas: ContentData[] = await collections.contentData.findMany({ contentId: context.params.contentid })
                    const maxArray = await collections.history.aggregate<{ max: number }>([
                        {
                            $match: {
                                contentId: context.params.contentid,
                            },
                        },
                        {
                            $group: {
                                _id: 1,
                                max: { $max: "$revision" },
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                max: { $ifNull: ["$max", 0] },
                            },
                        },
                    ])

                    const historyItem: HistoryItem = {
                        historyId: v4(),
                        contentId: context.params.contentid,
                        date: new Date(),
                        userId: user.userId,
                        changes: historyChanges,
                        revision: (maxArray[0]?.max || 0) + 1,
                        datas,
                    }
                    collections.history.create(historyItem)

                    await collections.content.updateOne(
                        { contentId: context.params.contentid },
                        {
                            $set: {
                                activeHistoryId: historyItem.historyId
                            },
                        }
                    )


                }

                let webhookFound = false;
                if (content.status !== data.status && data.status === "published") {
                    processWebhooks(context.params.spaceid, content.contentId, "content.publish")
                    webhookFound = true;
                }
                if (content.status !== data.status && content.status === "published") {
                    processWebhooks(context.params.spaceid, content.contentId, "content.unpublish")
                    webhookFound = true;
                }
                if (!webhookFound) {
                    if (data.status === "published") {
                        processWebhooks(context.params.spaceid, content.contentId, "content.update")
                    } else {
                        processWebhooks(context.params.spaceid, content.contentId, "draft.update")
                    }
                }

                return returnJSON<PutContentItemResponse>({}, PutContentItemResponseSchema)
            })
        })
    })
}

export async function PublishContent(contentId : string){

    const content = await collections.content.findOne({ contentId })
    if(!content){
        return;
    }

    await collections.content.updateOne({ contentId }, { $set : { status : "published"}})
    await collections.contentData.updateOne({ contentId }, { $set : { status : "published"}})
    await collections.content.updateOne({ contentId }, { $unset : { scheduledPublishDate : true}})

    if (content.status !== "published") {
        await processWebhooks(content.spaceId, content.contentId, "content.publish")
    }else{
        await processWebhooks(content.spaceId, content.contentId, "content.update")
    }

}

export async function DepublishContent(contentId : string){

    const content = await collections.content.findOne({ contentId })
    if(!content){
        return;
    }

    await collections.content.updateOne({ contentId }, { $set : { status : "draft"}})
    await collections.contentData.updateOne({ contentId }, { $set : { status : "draft"}})
    await collections.content.updateOne({ contentId }, { $unset : { scheduledDepublishDate : true}})

    if (content.status === "published") {
        await processWebhooks(content.spaceId, content.contentId, "content.unpublish")
    }

}

export async function FindContenToPublish(){
    const contents = await collections.content.findMany({ scheduledPublishDate : { $lt : new Date() } })
    
    for(const content of contents){
        await PublishContent(content.contentId)
    }
}

export async function FindContenToDepublish(){
    const contents = await collections.content.findMany({ scheduledDepublishDate : { $lt : new Date() } })
    for(const content of contents){
        await DepublishContent(content.contentId)
    }
}

export const PUT_DOC: generateRouteInfoParams = {
    tags: ["content"],
    path: "/space/:spaceid/content/:contentid",
    method: "put",
    summary: "Update content",
    requiresAuth: "user-jwt-token",
    params: ["spaceid", "contentid"],
    requestSchema: PutContentItemRequestSchema,
    responseSchema: PutContentItemResponseSchema,
    responseDescription: "Content successfully updated",
    errors: {
        ERROR_NOTFOUND: "Content not found"
    }
}