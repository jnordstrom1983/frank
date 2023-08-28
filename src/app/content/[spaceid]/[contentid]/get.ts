import { Block, BlockType } from "@/components/FieldEditors/Block/BlockEditor"
import { returnError, returnJSON, returnNotFound, withContentAccess, withUser } from "@/lib/apiUtils"
import { dbCollection, errorCodes } from "@/lib/constants"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { AssetSchema } from "@/models/asset"
import { ContentData, ContentDataAggregationSchema, ContentDataSchema, ContentDataViewSchema } from "@/models/contentdata"
import { ContentType } from "@/models/contentype"
import { SpaceUserRoleEnum } from "@/models/spaceuser"
import { UserSchema } from "@/models/user"
import { Filter } from "mongodb"
import { NextRequest } from "next/server"
import { z } from "zod"
import { GetContent, GetContentItemSchema } from "../get"

export const GetContentResponseSchema = ContentDataViewSchema

export type GetContentItemResponse = z.infer<typeof GetContentResponseSchema>
export type GetContentItem = z.infer<typeof GetContentItemSchema>


export async function GET(req: NextRequest, context: { params: { spaceid: string, contentid : string } }) {
    return await withContentAccess(req, context.params.spaceid, async (restrictedToContentTypes) => {
        const queryParams = Array.from(req.nextUrl.searchParams);


        let params: Record<string, string> = {};
        queryParams.forEach(param => {
            params[param[0]] = param[1]
        })
        params["spaceid"] = context.params.spaceid
        params["contentId"] = context.params.contentid

        if(!params["languageId"]){
            const space = await collections.space.findOne({spaceId : context.params.spaceid})
            if(!space){
                return returnNotFound("Space not found");
            }
            params["languageId"] = space.defaultLanguage
        }
      
        const items = await GetContent(params, restrictedToContentTypes, context.params.spaceid)
        if(items.length === 0){
            return returnNotFound("Content not found")
        }


        return returnJSON<GetContentItemResponse>(items[0], GetContentResponseSchema)
    })
}



export const GET_DOC: generateRouteInfoParams = {
    tags: ["content"],
    path: "/content/:spaceid/:contentid",
    method: "get",
    summary: "Get content item",
    requiresAuth: "content",
    params: ["spaceid", "contentid"],
    //@ts-ignore
    query: ["languageId", "expand", "expandLevels", "expandFallbackLanguageId", "project"],
    responseSchema: GetContentResponseSchema,
    responseDescription: "Content",
    errors: {

    }
}