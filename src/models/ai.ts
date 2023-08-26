import { z } from "zod"
import { SpaceLanguageEnum } from "./space"

export const AIModuleSchema = z.enum(["check", "translate", "reprahse", "generate"])
export type AIModule = z.infer<typeof AIModuleSchema>

export const AITaskStateSchema = z.enum(["new", "done", "error"])
export type AITaskState = z.infer<typeof AITaskStateSchema>

export const AITaskSchema = z.object({
    taskId: z.string(),
    spaceId : z.string(),
    module: AIModuleSchema,
    data: z.record(z.string(), z.any()),
    languages: z.record(z.string(), SpaceLanguageEnum).optional(),
    details: z.record(z.string(), z.any()).optional(),
    state: AITaskStateSchema,
    createdUserId : z.string(),
    created : z.date(),
    started : z.date().optional(),
    completed : z.date().optional(),
    result : z.object({
        data : z.record(z.string(), z.any()).optional()
    }).optional()
})
export type AITask = z.infer<typeof AITaskSchema>
