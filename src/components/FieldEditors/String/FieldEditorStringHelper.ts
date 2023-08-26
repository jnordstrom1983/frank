import { Field } from "@/models/field"
import { ZodEnum, ZodString, z, ZodEffects } from "zod"

export function GetStringValidationSchema(field: Field) {
    let validationSchema: ZodString | ZodEnum<any> = z.string()
    if (field.options) {
        if (field.validators.required?.enabled) {
            //@ts-ignore
            validationSchema = z.enum([...field.options.map((f) => f.toString())])
        } else {
            //@ts-ignore
            validationSchema = z.enum([...field.options.map((f) => f.toString()), ""])
        }
    } else {
        if (field.validators.maxLength?.enabled) validationSchema = validationSchema.max(field.validators.maxLength.max)
        if (field.validators.minLength?.enabled || field.validators.required?.enabled)
            validationSchema = validationSchema.min(Math.max(field.validators.minLength?.min || 0, field.validators.required?.enabled ? 1 : 0))
    }
    return validationSchema
}

export function ValidateStringFieldValue(field: Field, value: string | undefined) {
    const validationSchema = GetStringValidationSchema(field);
    return ValidateStringValue(validationSchema, value)
}

export function ValidateStringValue(validationSchema: ZodString | ZodEnum<any> | ZodEffects<any>, value: string | undefined) {
    return validationSchema.safeParse((`${value === undefined ? "" : value}`))
}