import { z } from "zod"

export const MaxValueValidatorPropertiesSchema = z.object({
    enabled: z.boolean(),
    max: z.number()
})
export type MaxValueValidatorProperties = z.infer<typeof MaxValueValidatorPropertiesSchema>