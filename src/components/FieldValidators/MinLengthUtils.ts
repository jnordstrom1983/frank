import { z } from "zod"

export const MinLengthValidatorPropertiesSchema = z.object({
    enabled: z.boolean(),
    min: z.number()
})
export type MinLengthValidatorProperties = z.infer<typeof MinLengthValidatorPropertiesSchema>