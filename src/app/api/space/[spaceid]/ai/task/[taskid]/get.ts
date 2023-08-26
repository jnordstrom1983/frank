import { returnJSON, returnNotFound, withRequestBody, withSpaceRole, withUser } from "@/lib/apiUtils"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"
import { AITaskSchema } from "@/models/ai"
import { ContentTypeSchema } from "@/models/contentype"
import { z } from "zod"


const GetAITaskItemResponseSchema = AITaskSchema.pick({
    state: true,
    result: true,
    taskId: true
})

export type GetAITaskItemResponse = z.infer<typeof GetAITaskItemResponseSchema>


export async function GET(req: Request, context: { params: { spaceid: string, taskid: string } }) {


    return await withUser(req, "any", async (user) => {
        return await withSpaceRole(user, context.params.spaceid, "any", async (role) => {

            const task = await collections.aiTask.findOne({ taskId: context.params.taskid, createdUserId: user.userId })
            if (!task) {
                return returnNotFound("Task not found");
            }

            return returnJSON<GetAITaskItemResponse>({ state: task.state, result: task.result, taskId: task.taskId }, GetAITaskItemResponseSchema)

        })

    })
}

export const GET_DOC: generateRouteInfoParams = {
    tags: ["ai"],
    path: "/space/:spaceid/ai/task/:taskid",
    method: "get",
    summary: "Get AI task",
    requiresAuth: "user-jwt-token",
    params: ["spaceid", "taskid"],
    responseSchema: GetAITaskItemResponseSchema,
    responseDescription: "AI Task",
    errors: {
        ERROR_NOTFOUND: "Task not found"
    }
}