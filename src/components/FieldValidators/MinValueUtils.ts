import { z } from "zod"

export const MinValueValidatorPropertiesSchema = z.object({
    enabled: z.boolean(),
    min: z.number()
})
export type MinValueValidatorProperties = z.infer<typeof MinValueValidatorPropertiesSchema>

