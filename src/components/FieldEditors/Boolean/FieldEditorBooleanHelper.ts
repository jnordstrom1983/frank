import { Field } from "@/models/field"
import { ZodEnum, ZodString, z, ZodEffects, ZodBoolean, ZodOptional } from "zod"

export function GetBooleanValidationSchema(field: Field) {

    let validationSchema : ZodOptional<any> | ZodString | ZodEnum<any> | ZodEffects<any>  = z.string().transform((value) => value === undefined ? undefined :  value === "true").optional()
    
    if (field.validators.required?.enabled) validationSchema = z.string().transform((value) => value === undefined ? undefined :  value === "true")

    return validationSchema;
}

export function ValidateBooleanFieldValue(field: Field, value: boolean | undefined) {
    const validationSchema = GetBooleanValidationSchema(field);
    return ValidateBooleanValue(validationSchema, value)
}

export function ValidateBooleanValue(validationSchema: ZodOptional<any> | ZodString | ZodEnum<any> | ZodEffects<any>, value: boolean | undefined) {
    
    return validationSchema.safeParse(`${value === undefined ? "" : value}`)
}