import { processAITask } from "@/lib/ai"
import { returnJSON, withRequestBody, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { AITask, AITaskSchema } from "@/models/ai"
import { v4 as uuidv4 } from "uuid"
import { z } from "zod"

const PostAIRequestSchema = AITaskSchema.pick({
    module: true,
    data: true,
    languages: true,
    details: true
})
export type PostAIRequest = z.infer<typeof PostAIRequestSchema>


const PostAIResponseSchema = z.object({
    taskId: z.string()
})
export type PostAIResponse = z.infer<typeof PostAIResponseSchema>


export async function POST(req: Request, context: { params: { spaceid: string } }) {
    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "any", async (role) => {
            return await withRequestBody(req, PostAIRequestSchema, async (data) => {


                const task: AITask = {
                    ...data,
                    spaceId: context.params.spaceid,
                    taskId: uuidv4(),
                    createdUserId: user.userId,
                    created: new Date(),
                    state: "new",
                }

                await collections.aiTask.create(task);
                processAITask(task.taskId)
                return returnJSON<PostAIResponse>({ taskId: task.taskId }, PostAIResponseSchema)

            })

        })
    })
}


export const POST_DOC: generateRouteInfoParams = {
    tags: ["ai"],
    path: "/space/:spaceid/ai",
    method: "post",
    summary: "Create new AI task",
    requiresAuth: "user-jwt-token",
    params: ["spaceid"],
    requestSchema: PostAIRequestSchema,
    responseSchema: PostAIResponseSchema,
    responseDescription: "Successfully created AI task",
    errors: {

    }
}
