import { Field } from "@/models/field"
import { ZodEnum, ZodString, z, ZodEffects, ZodArray, ZodOptional } from "zod"

export function GetReferenceArrayValidationSchema(field: Field) {
    let validationSchema: ZodArray<ZodString>= z.array(z.string())
    if (field.validators.required?.enabled) {
        validationSchema = validationSchema.min(1)
    }
    return validationSchema
}

export function ValidateReferenceArrayFieldValue(field: Field, value: string[] | undefined) {
    const validationSchema = GetReferenceArrayValidationSchema(field)
    return ValidateReferenceArrayValue(validationSchema, value)
}

export function ValidateReferenceArrayValue(validationSchema: ZodArray<ZodString>, value: string[] | undefined) {
    return validationSchema.safeParse(value)
}
