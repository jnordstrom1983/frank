import { returnNotFound, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { AssetSchema } from "@/models/asset"
import { NextResponse } from "next/server"
import { z } from "zod"

export const PostAssetResponseSchema = AssetSchema
export type PostAssetResponse = z.infer<typeof PostAssetResponseSchema>

export async function GET(req: Request, context: { params: { spaceid: string, assetid: string } }) {

    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "any", async (role) => {
            const asset = await collections.asset.findOne({
                assetId: context.params.assetid,
                spaceId: context.params.spaceid
            });
            if (!asset) {
                return returnNotFound("Asset not found");
            }
            const headers = new Headers();

            headers.set("Content-Type", "image/*");

            const res = await fetch(asset.url);
            const blob = await res.blob();
            return new NextResponse(blob, { status: 200, statusText: "OK", headers });
        })
    })

}
