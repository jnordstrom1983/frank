import { z } from "zod"

export const RequiredValidatorPropertiesSchema = z.object({
    enabled: z.boolean()
})
export type RequiredValidatorProperties = z.infer<typeof RequiredValidatorPropertiesSchema>