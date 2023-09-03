import { z } from "zod"
import { MaxLengthValidatorPropertiesSchema } from "@/components/FieldValidators/MaxLengthUtils"
import { MaxValueValidatorPropertiesSchema } from "@/components/FieldValidators/MaxValueUtils"
import { MinLengthValidatorPropertiesSchema } from "@/components/FieldValidators/MinLengthUtils"
import { MinValueValidatorPropertiesSchema } from "@/components/FieldValidators/MinValueUtils"
import { RequiredValidatorPropertiesSchema } from "@/components/FieldValidators/RequiredUtils"
import { UniqueValidatorPropertiesSchema } from "@/components/FieldValidators/UniqueSchemas"

export const dataTypeValidatorProperties = z.object({ enabled: z.boolean() })
export const dataTypeValidatorsSchema = z.object({
    required: RequiredValidatorPropertiesSchema.optional(),
    unique: UniqueValidatorPropertiesSchema.optional(),
    maxLength: MaxLengthValidatorPropertiesSchema.optional(),
    minLength: MinLengthValidatorPropertiesSchema.optional(),
    maxValue: MaxValueValidatorPropertiesSchema.optional(),
    minValue: MinValueValidatorPropertiesSchema.optional(),
})
export type dataTypeValidators = z.infer<typeof dataTypeValidatorsSchema>

export const dataTypeSettingsProperties = z.object({}).optional()
export const dataTypeSettingsSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(["textbox", "checkbox", "contenttypes", "checkboxes", "checkboxInput", "objectProperties"]),
    data: z.any(),
})
export type dataTypeSettings = z.infer<typeof dataTypeSettingsSchema>

export const dataTypeVariantSchema = z.object({
    id: z.string(),
    name: z.string(),
    options: z.enum(["disabled", "enabled", "mandatory"]),
    optionsType: z.enum(["string", "number"]).optional(),
    validators: dataTypeValidatorsSchema,
    settings: z.array(dataTypeSettingsSchema),
    canBeTitle: z.boolean(),
    defaultValue: z.any().optional(),
    ai: z.object({
        check: z.boolean(),
        translate: z.boolean(),
        reprahse: z.boolean(),
    }),
})
export type dataTypeVariant = z.infer<typeof dataTypeVariantSchema>

export const dataTypeSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    variants: z.array(dataTypeVariantSchema),
})

export type dataType = z.infer<typeof dataTypeSchema>
