import { Field } from "@/models/field"
import { ZodEnum, ZodString, z, ZodEffects, ZodArray, ZodOptional } from "zod"

export function GetAssetArrayValidationSchema(field: Field) {
    let validationSchema: ZodArray<ZodString> = z.array(z.string())
    if (field.validators.required?.enabled) {
        validationSchema = validationSchema.min(1)
    }
    return validationSchema
}

export function ValidateAssetArrayFieldValue(field: Field, value: string[] | undefined) {
    const validationSchema = GetAssetArrayValidationSchema(field)
    return ValidateAssetArrayValue(validationSchema, value)
}

export function ValidateAssetArrayValue(validationSchema: ZodArray<ZodString>, value: string[] | undefined) {
    return validationSchema.safeParse(value)
}
