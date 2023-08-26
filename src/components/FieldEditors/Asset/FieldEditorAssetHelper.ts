import { Field } from "@/models/field"
import { ZodEnum, ZodString, z, ZodEffects, ZodArray, ZodOptional } from "zod"

export function GetAssetValidationSchema(field: Field) {
    let validationSchema: ZodString | ZodOptional<any> = z.string()
    if (!field.validators.required?.enabled) {
        validationSchema = validationSchema.optional()
    } else {
        validationSchema = validationSchema.min(1)
    }
    return validationSchema
}

export function ValidateAssetFieldValue(field: Field, value: string | undefined) {
    const validationSchema = GetAssetValidationSchema(field)
    return ValidateAssetValue(validationSchema, value)
}

export function ValidateAssetValue(validationSchema: ZodString | ZodOptional<any>, value: string | undefined) {
    return validationSchema.safeParse(`${value === undefined ? "" : value}`)
}
