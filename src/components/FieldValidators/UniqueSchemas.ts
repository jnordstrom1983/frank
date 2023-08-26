import { z } from "zod"

export const UniqueValidatorPropertiesSchema = z.object({
    enabled: z.boolean()
})
export type UniqueValidatorProperties = z.infer<typeof UniqueValidatorPropertiesSchema>