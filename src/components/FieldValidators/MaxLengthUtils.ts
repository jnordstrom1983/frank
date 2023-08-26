import { z } from "zod"

export const MaxLengthValidatorPropertiesSchema = z.object({
    enabled: z.boolean(),
    max: z.number()
})
export type MaxLengthValidatorProperties = z.infer<typeof MaxLengthValidatorPropertiesSchema>