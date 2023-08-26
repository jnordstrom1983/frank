import { MaxLengthValidatorPropertiesSchema } from "@/components/FieldValidators/MaxLengthUtils"
import { MaxValueValidatorPropertiesSchema } from "@/components/FieldValidators/MaxValueUtils"
import { MinLengthValidatorPropertiesSchema } from "@/components/FieldValidators/MinLengthUtils"
import { MinValueValidatorPropertiesSchema } from "@/components/FieldValidators/MinValueUtils"
import { RequiredValidatorPropertiesSchema } from "@/components/FieldValidators/RequiredUtils"
import { UniqueValidatorPropertiesSchema } from "@/components/FieldValidators/UniqueSchemas"
import { z } from "zod"

export const FieldValidatorsSchema = z.object({
    required: RequiredValidatorPropertiesSchema.optional(),
    unique: UniqueValidatorPropertiesSchema.optional(),
    maxLength: MaxLengthValidatorPropertiesSchema.optional(),
    minLength: MinLengthValidatorPropertiesSchema.optional(),
    maxValue: MaxValueValidatorPropertiesSchema.optional(),
    minValue: MinValueValidatorPropertiesSchema.optional(),
})
export type FieldValidators = z.infer<typeof FieldValidatorsSchema>

export const FieldSettingSchema = z.object({ id: z.string(), value: z.any() })
export type FieldSetting = z.infer<typeof FieldSettingSchema>

export const FieldOptionSchema = z.string().or(z.number())
export type FieldOption = z.infer<typeof FieldOptionSchema>


export const FieldSchema = z.object({
    fieldId: z.string(),
    name: z.string().min(3),
    title: z.boolean(),
    description: z.string().min(0),
    dataTypeId: z.string(),
    dataTypeVariantId: z.string(),
    options: z.array(FieldOptionSchema).optional(),
    validators: FieldValidatorsSchema,
    settings: z.array(FieldSettingSchema)
})
export type Field = z.infer<typeof FieldSchema>
