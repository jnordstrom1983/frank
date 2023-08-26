import { returnJSON, returnNotFound, withSpaceRole, withUser } from "@/lib/apiUtils"
import { dbCollection } from "@/lib/constants"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { AssetSchema } from "@/models/asset"
import { z } from "zod"

export const AssetInternalViewModelSchema = AssetSchema.pick({
    assetId: true,
    type: true,
    assetFolderId: true,
    name: true,
    createdDate: true,
    modifiedUserId: true,
    modifiedDate: true,
    status: true,
    url: true,
    description: true
}).extend({
    folderName: z.string().optional(),
    modifiedUserName: z.string(),


})

const GetAssetResponseSchema = z.object({
    items: z.array(AssetInternalViewModelSchema),
})

export type AssetInternalViewModel = z.infer<typeof AssetInternalViewModelSchema>

export type GetAssetResponse = z.infer<typeof GetAssetResponseSchema>

export async function GET(req: Request, context: { params: { spaceid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "any", async (role) => {
            const space = await collections.space.findOne({ spaceId: context.params.spaceid })
            if (!space) {
                return returnNotFound("Space not found")
            }

            const aggregatedData = await collections.asset.aggregate<AssetInternalViewModel>([
                {
                    $match: { spaceId: context.params.spaceid },
                },
                {
                    $lookup: {
                        from: dbCollection.assetFolder,
                        localField: "assetFolderId",
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
                    $project: {
                        assetId: 1,
                        type: 1,
                        assetFolderId: 1,
                        name: 1,
                        createdDate: 1,
                        modifiedUserId: 1,
                        modifiedDate: 1,
                        status: 1,
                        folder: { $arrayElemAt: ["$folders", 0] },
                        user: { $arrayElemAt: ["$users", 0] },
                        url: 1,
                        description: 1,
                    },
                },
                {
                    $project: {
                        assetId: 1,
                        type: 1,
                        assetFolderId: 1,
                        name: 1,
                        createdDate: 1,
                        modifiedUserId: 1,
                        modifiedDate: 1,
                        status: 1,
                        folderName: "$folder.name",
                        modifiedUserName: "$user.name",
                        url: 1,
                        description: 1,
                    },
                },
                {
                    $sort: {
                        modifiedDate: -1,
                    },
                },
            ])



            return returnJSON<GetAssetResponse>(
                {
                    items: aggregatedData,
                },
                GetAssetResponseSchema
            )
        })
    })
}


export const GET_DOC: generateRouteInfoParams = {
    tags: ["asset"],
    path: "/space/:spaceid/asset",
    method: "get",
    summary: "List assets",
    requiresAuth: "user-jwt-token",
    params: ["spaceid"],
    responseSchema: GetAssetResponseSchema,
    responseDescription: "List of assets",
    errors: {

    }
}