import { Block, BlockType } from "@/components/FieldEditors/Block/BlockEditor"
import { returnError, returnJSON, returnNotFound, withContentAccess, withUser } from "@/lib/apiUtils"
import { dbCollection, errorCodes } from "@/lib/constants"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { AssetSchema } from "@/models/asset"
import { ContentData, ContentDataAggregationSchema, ContentDataSchema, ContentDataViewSchema } from "@/models/contentdata"
import { ContentType } from "@/models/contentype"
import { SpaceLanguageEnum } from "@/models/space"
import { SpaceUserRoleEnum } from "@/models/spaceuser"
import { UserSchema } from "@/models/user"
import { Filter } from "mongodb"
import { NextRequest } from "next/server"
import { z } from "zod"

export const GetContentItemSchema = ContentDataAggregationSchema.omit({
    contentDataId: true,
    modifiedUserId: true,
    spaceId: true,
    referencedAssets: true,
    status: true
})
export const GetContentResponseSchema = z.object({
    items: z.array(ContentDataViewSchema),
})

export type GetContentResponse = z.infer<typeof GetContentResponseSchema>
export type GetContentItem = z.infer<typeof GetContentItemSchema>

const AggregatedContentDataItemSchema = ContentDataAggregationSchema.omit({
    referencedAssets: true
}).extend({
    referencedAssets: z.array(AssetSchema)
})
type AggregatedContentDataItemSchema = z.infer<typeof AggregatedContentDataItemSchema>

export async function GET(req: NextRequest, context: { params: { spaceid: string } }) {
    return await withContentAccess(req, context.params.spaceid, async (restrictedToContentTypes, drafts) => {
        const queryParams = Array.from(req.nextUrl.searchParams);


        let params: Record<string, string> = {};
        queryParams.forEach(param => {
            params[param[0]] = param[1]
        })
        params["spaceid"] = context.params.spaceid

        //Parse query
        if (params["query"]) {
            try {
                let customQuery = JSON.parse(params["query"]);
            } catch (ex: any) {
                return returnError({ error: ex.message, code: errorCodes.invalidRequestBody, message: "Invalid query supplied", status: 422 })
            }
        }
        const items = await GetContent(params, restrictedToContentTypes, context.params.spaceid, !!drafts)

        return returnJSON<GetContentResponse>({ items }, GetContentResponseSchema)
    })
}


export async function GetContent(params: Record<string, string>, restrictedToContentTypes : string[] | undefined, spaceId : string, drafts : boolean){

    console.log("drafts", drafts)
    let query: Filter<ContentData> = [];
    if(drafts && params["draft"]){
        query.push({ spaceId: params["spaceid"], status: { $in : ["published", "draft"] } })
    }else{
        query.push({ spaceId: params["spaceid"], status: "published" })
    }
    console.log(query)


    const space = await collections.space.findOne({ spaceId: params.spaceid })
    const contentTypes = await collections.contentType.findMany({ spaceId: params.spaceid })
    //Query on content type
    if (restrictedToContentTypes) {
        let filterContentTypes = [...restrictedToContentTypes]
        if (params["contentTypeId"]) {
            const types = params["contentTypeId"].split(",");
            filterContentTypes = filterContentTypes.filter(p => types.includes(p))
        }
        query.push({ "contentTypeId": { $in: filterContentTypes } })
    } else {
        if (params["contentTypeId"]) {
            query.push({ "contentTypeId": { $in: params["contentTypeId"].split(",") } })
        }
    }

    //Query on contentId
    if (params["contentId"]) {
        query.push({ "contentId": { $in: params["contentId"].split(",") } })
    }

    //Query on slug
    if (params["slug"]) {
        query.push({ "slug": { $in: params["slug"].split(",") } })
    }

    //Query on language
    let languages: string[] = [space!.defaultLanguage]
    if (params["languageId"]) {
        if(params["languageId"] !== "*"){
            query.push({ "languageId": { $in: params["languageId"].split(",") } })
            languages = params["languageId"].split(",");
        }else{
            languages = SpaceLanguageEnum.options;
        }
    } else {
        query.push({ "languageId": space!.defaultLanguage })
    }

    //Query on folderId
    if (params["folderId"]) {
        query.push({ "folderId": { $in: params["folderId"].split(",") } })
    }

        //Query on custom query
        if (params["query"]) {
            let customQuery = JSON.parse(params["query"]);
            Object.keys(customQuery).forEach(k => {
                let obj: any = {};
                obj[k] = customQuery[k];
                query.push(obj)
            })
        }



    let aggregationPipeline: any[] = [{ $match: { $and: query } }, {
        $lookup: {
            from: dbCollection.asset,
            localField: "referencedAssets",
            foreignField: "assetId",
            as: "referencedAssets",
        },

    },]
    let projection: { [key: string]: number } | undefined = undefined
    if (params["project"]) {
        let paramsArr = params["project"].split(",");
        projection = {
            contentDataId: 1,
            spaceId: 1,
            contentTypeId: 1,
            contentId: 1,
            folderId: 1,
            languageId: 1,
            modifiedUserId: 1,
            modifiedDate: 1,
            referencedAssets: 1,
            status: 1,
            slug : 1,
            publishDate : 1,
         }
        paramsArr.forEach(p => {
            projection![`data.${p}`] = 1;
        })
        aggregationPipeline.push({ "$project": projection })
    }


    if(params["sort"]){
        let sort = params["sort"];
        let sortObject : any = null
        try{
            sortObject = JSON.parse(sort);
        }catch(ex){

        }
        if(!sortObject){
            sortObject = {};
            let sortDirection = params["sortDirection"] ? (params["sortDirection"] === "asc" ? 1 : -1) : 1;
            let sortArray = sort.split(",")
            sortArray.forEach(s=>{
                sortObject[s] = sortDirection;
            })
        }
        aggregationPipeline.push({
            $sort : sortObject
        })
    }


    

    const dbItems = await collections.contentData.aggregate<AggregatedContentDataItemSchema>(aggregationPipeline)

    let items = dbItems.map(item => processDBItem(item, contentTypes))

    const expandMaxLevels = params["expandLevels"] ? parseInt(params["expandLevels"]) : 1;

    if (params["expand"]) {

        let fallbackLanguageId = params["expandFallbackLanguageId"] || space!.defaultLanguage;

        items = await expandItems(spaceId, items, expandMaxLevels, contentTypes, languages, fallbackLanguageId, projection)
    }
    return items
}

function processDBItem(item: AggregatedContentDataItemSchema, contentTypes: ContentType[]) {
    //@ts-ignore
    delete item._id
    
    const { contentDataId, modifiedUserId, spaceId, referencedAssets, status, ...rest } = item;

    const contentType = contentTypes.find(c => c.contentTypeId === rest.contentTypeId)
    if (contentType && rest.data) {
        contentType.fields.filter(p => !p.output).forEach(f => {
            //@ts-ignore
            delete item.data[f.fieldId]
        })
        contentType.fields.filter(p => p.dataTypeId === "asset").forEach(f => {

            if (rest.data && rest.data[f.fieldId]) {
                const asset = referencedAssets.find(a => a.assetId === rest.data![f.fieldId])
                if (asset) {
                    rest.data[f.fieldId] = {
                        assetId: asset.assetId,
                        url: asset.url,
                        type: asset.type,
                        filename: asset.filename,
                        name: asset.name,
                        description: asset.description
                    };
                }
            }
        })
        contentType.fields.filter(p => p.dataTypeId === "assetArray").forEach(f => {
            if (!rest.data) return;
            const val = rest.data[f.fieldId]
            if (val && Array.isArray(val)) {
                let arr: any[] = []
                val.forEach(v => {
                    const asset = referencedAssets.find(a => a.assetId === v)
                    if (asset) {
                        arr.push({
                            assetId: asset.assetId,
                            url: asset.url,
                            type: asset.type,
                            filename: asset.filename,
                            name: asset.name,
                            description: asset.description
                        })
                    }
                })
                rest.data[f.fieldId] = arr;
            }
        })
        contentType.fields.filter(p => p.dataTypeId === "blocks").forEach(f => {
            if (!rest.data) return;
            const val = rest.data[f.fieldId]
            if (val && Array.isArray(val)) {
                val.filter(v => v.type === "asset").forEach((b) => {
                    const index = val.findIndex(v=>v.id === b.id)
                    const asset = referencedAssets.find(a => a.assetId === b.data)
                    if (asset && rest.data) {
                        rest.data[f.fieldId][index].data  = {
                            assetId: asset.assetId,
                            url: asset.url,
                            type: asset.type,
                            filename: asset.filename,
                            name: asset.name,
                            description: asset.description
                        }
                    }
                })

            }
        })



    }
    return rest;
}

async function expandItems(spaceId: string, items: GetContentItem[], maxLevels: number, contentTypes: ContentType[], languages: string[], fallbackLanguageId: string, projection?: any) {
    const allItems = [...items]

    let toExpand = await findItemsToExpand(items, contentTypes)
    toExpand = toExpand.filter(t => !allItems.find(d => d.contentId === t))
    let iteration = 1;
    while (toExpand.length > 0 && iteration < maxLevels + 1) {
        iteration++;

        let aggregationPipeline: any = [{ $match: { spaceId: spaceId, contentId: { $in: toExpand }, languageId: { $in: [...languages, fallbackLanguageId] } } }, {
            $lookup: {
                from: dbCollection.asset,
                localField: "referencedAssets",
                foreignField: "assetId",
                as: "referencedAssets",
            },

        },]
        if (projection) {
            aggregationPipeline.push({ "$project": projection })
        }

        const dbItems = await collections.contentData.aggregate<AggregatedContentDataItemSchema>(aggregationPipeline)

        let expandedItems = dbItems.map(item => processDBItem(item, contentTypes))
        expandedItems.forEach(item => {
            if (!allItems.find(ai => ai.contentId === item.contentId && ai.languageId === item.languageId)) {
                allItems.push(item)
            }
        })
        toExpand = await findItemsToExpand(expandedItems, contentTypes)
        toExpand = toExpand.filter(t => !allItems.find(d => d.contentId === t))
    }

    return items.map(item => injectExpanded({ ...item }, allItems, contentTypes, 1, maxLevels, fallbackLanguageId))

}

function findItemsToExpand(items: GetContentItem[], contentTypes: ContentType[]) {
    let toExpand: string[] = []
    items.forEach(item => {
        const contentType = contentTypes.find(c => c.contentTypeId === item.contentTypeId)
        if (!contentType) return;

        //Locate in all reference fields
        const referenceFields = contentType.fields.filter(p => p.dataTypeId === "reference")
        referenceFields.forEach(field => {
            if (!item.data) return;
            const value = item.data[field.fieldId];
            if (value) {
                if (!toExpand.includes(value)) {
                    toExpand.push(value)
                }
            }
        })

        //Locate in all referenceArray fields
        const referenceArratFields = contentType.fields.filter(p => p.dataTypeId === "referenceArray")
        referenceArratFields.forEach(field => {
            if (!item.data) return;
            const value = item.data[field.fieldId];
            if (Array.isArray(value)) {
                value.forEach(arrValue => {
                    if (!toExpand.includes(arrValue)) {
                        toExpand.push(arrValue)
                    }
                })
            }
        })

        //Locate in all blocks.reference
        const blocksFields = contentType.fields.filter(p => p.dataTypeId === "blocks");
        blocksFields.forEach(filed => {
            if (!item.data) return;
            //Find blocks that are references
            const value = item.data[filed.fieldId] as Block[];
            if (Array.isArray(value)) {
                value.filter(v => v.type === "reference").forEach(v => {
                    if (v.data) {
                        toExpand.push(v.data)
                    }
                })
            }
        })

    })
    return toExpand;
}

function injectExpanded(item: GetContentItem, allItems: GetContentItem[], contentTypes: ContentType[], level: number, maxLevels: number, fallbackLanguageId: string) {
    if (level > maxLevels) return item;
    const contentType = contentTypes.find(c => c.contentTypeId === item.contentTypeId)
    if (!contentType) return item;

    //Inject in all reference fields
    const referenceFields = contentType.fields.filter(p => p.dataTypeId === "reference")
    referenceFields.forEach(field => {
        if (!item.data) return;
        const value = item.data[field.fieldId];
        if (value) {
            let itemToInject = allItems.find(p => p.contentId === value && p.languageId === item.languageId);
            if (!itemToInject) {
                itemToInject = allItems.find(p => p.contentId === value && p.languageId === fallbackLanguageId);
            }
            if (itemToInject) {
                item.data[field.fieldId] = injectExpanded(JSON.parse(JSON.stringify(itemToInject)), allItems, contentTypes, level + 1, maxLevels, fallbackLanguageId)
            }
        }
    })


    //Inject in all referenceArray fields
    const referenceArratFields = contentType.fields.filter(p => p.dataTypeId === "referenceArray")
    referenceArratFields.forEach(field => {
        if (!item.data) return;
        const value = item.data[field.fieldId];
        if (Array.isArray(value)) {
            value.forEach((arrValue, arrIndex) => {
                let itemToInject = allItems.find(p => p.contentId === arrValue && p.languageId === item.languageId);
                if (!itemToInject) {
                    itemToInject = allItems.find(p => p.contentId === arrValue && p.languageId === fallbackLanguageId);
                }
                if (itemToInject) {
                    item.data![field.fieldId][arrIndex] = injectExpanded(JSON.parse(JSON.stringify(itemToInject)), allItems, contentTypes, level + 1, maxLevels, fallbackLanguageId)
                }
            })
        }
    })


    //Locate in all blocks.reference
    const blocksFields = contentType.fields.filter(p => p.dataTypeId === "blocks");
    blocksFields.forEach(filed => {
        if (!item.data) return;
        //Find blocks that are references
        const value = item.data[filed.fieldId] as Block[];
        if (Array.isArray(value)) {
            value.filter(v => v.type === "reference").forEach(v => {
                let itemToInject = allItems.find(p => p.contentId === v.data && p.languageId === item.languageId);
                if (!itemToInject) {
                    itemToInject = allItems.find(p => p.contentId === v.data && p.languageId === fallbackLanguageId);
                }
                if (itemToInject) {
                    const index = value.findIndex(p => p.id === v.id);
                    item.data![filed.fieldId][index].data = injectExpanded(JSON.parse(JSON.stringify(itemToInject)), allItems, contentTypes, level + 1, maxLevels, fallbackLanguageId)
                }
            })
        }
    })



    return item;
}


export const GET_DOC: generateRouteInfoParams = {
    tags: ["content"],
    path: "/content/:spaceid",
    method: "get",
    summary: "Get content",
    requiresAuth: "content",
    params: ["spaceid"],
    //@ts-ignore
    query: ["contentTypeId", "contentId", "folderId", "languageId", "expand", "expandLevels", "expandFallbackLanguageId", "query", "project", "slug", "sort", "sortDirection", "draft"],
    responseSchema: GetContentResponseSchema,
    responseDescription: "Content",
    errors: {

    }
}