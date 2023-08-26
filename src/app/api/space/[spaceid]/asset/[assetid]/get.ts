import { returnJSON, returnNotFound, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { AssetSchema } from "@/models/asset"
import { z } from "zod"

const GetAssetItemResponseSchema = AssetSchema

export type GetAssetItemResponse = z.infer<typeof GetAssetItemResponseSchema>

export async function GET(req: Request, context: { params: { spaceid: string, assetid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "any", async (role) => {
            const asset = await collections.asset.findOne({ spaceId: context.params.spaceid, assetId: context.params.assetid })
            if (!asset) {
                return returnNotFound("Asset not found")
            }

            return returnJSON<GetAssetItemResponse>(
                asset,
                GetAssetItemResponseSchema
            )
        })
    })
}

export const GET_DOC: generateRouteInfoParams = {
    tags: ["asset"],
    path: "/space/:spaceid/asset/:assetid",
    method: "get",
    summary: "Get asset",
    requiresAuth: "user-jwt-token",
    params: ["spaceid", "assetid"],
    responseSchema: GetAssetItemResponseSchema,
    responseDescription: "Asset",
    errors: {
        ERROR_NOTFOUND: "Asset not found"
    }
}