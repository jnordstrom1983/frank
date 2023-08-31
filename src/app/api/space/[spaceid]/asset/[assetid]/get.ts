import { returnJSON, returnNotFound, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { AssetSchema } from "@/models/asset"
import { string, z } from "zod"

const GetAssetItemResponseSchema = AssetSchema.extend({
    usedBy: z.array(z.string()),
})

export type GetAssetItemResponse = z.infer<typeof GetAssetItemResponseSchema>

export async function GET(req: Request, context: { params: { spaceid: string; assetid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "any", async (role) => {
            const asset = await collections.asset.findOne({ spaceId: context.params.spaceid, assetId: context.params.assetid })
            if (!asset) {
                return returnNotFound("Asset not found")
            }

            const usedByAggregation = await collections.contentData.aggregate<{ _id: string; contentId: string }>([
                {
                    $match: {
                        referencedAssets: asset.assetId,
                    },
                },
                {
                    $group: {
                        _id: "$contentId",
                    },
                },
                {
                    $project: {
                        contentId: "$_id",
                    },
                },
            ])

            return returnJSON<GetAssetItemResponse>({ ...asset, usedBy: usedByAggregation.map((p) => p.contentId) }, GetAssetItemResponseSchema)
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
        ERROR_NOTFOUND: "Asset not found",
    },
}
