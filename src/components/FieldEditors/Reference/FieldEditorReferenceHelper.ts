import { Field } from "@/models/field"
import { ZodEnum, ZodString, z, ZodEffects, ZodArray, ZodOptional } from "zod"

export function GetReferenceValidationSchema(field: Field) {
    let validationSchema: ZodString | ZodOptional<any> = z.string()
    if (!field.validators.required?.enabled) {
        validationSchema = validationSchema.optional()
    } else {
        validationSchema = validationSchema.min(1)
    }
    return validationSchema
}

export function ValidateReferenceFieldValue(field: Field, value: string | undefined) {
    const validationSchema = GetReferenceValidationSchema(field)
    return ValidateReferenceValue(validationSchema, value)
}

export function ValidateReferenceValue(validationSchema: ZodString | ZodOptional<any>, value: string | undefined) {
    return validationSchema.safeParse(`${value === undefined ? "" : value}`)
}
