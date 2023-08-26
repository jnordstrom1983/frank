import { returnJSON, returnNotFound, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs";
import { processWebhooks } from "@/lib/webhook";
import { z } from "zod"

export async function DELETE(req: Request, context: { params: { spaceid: string; contentid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "any", async (role) => {
            const content = await collections.content.findOne({ contentId: context.params.contentid, spaceId: context.params.spaceid })
            if (!content) {
                return returnNotFound("Content not found")
            }
            const datas = await collections.contentData.findMany({ contentId: context.params.contentid })

            collections.trash.create({
                ...content,
                deletedUserId: user.userId,
                deleted: new Date(),
                datas,
            })

            await collections.contentData.deleteMany({ contentId: context.params.contentid })
            await collections.content.deleteMany({ contentId: context.params.contentid, spaceId: context.params.spaceid })

            if (content.status === "published") {
                processWebhooks(context.params.spaceid, content.contentId, "content.delete")
            } else {
                processWebhooks(context.params.spaceid, content.contentId, "draft.delete")
            }


            return returnJSON<{}>({}, z.object({}))
        })
    })
}


export const DELETE_DOC: generateRouteInfoParams = {
    tags: ["content"],
    path: "/space/:spaceid/content/:contentid",
    method: "delete",
    summary: "Delete content",
    requiresAuth: "user-jwt-token",
    params: ["spaceid", "contentid"],
    responseSchema: z.object({}),
    responseDescription: "Content successfully deleted",
    errors: {
        ERROR_NOTFOUND: "Content not found"
    }
}