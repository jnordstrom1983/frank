import { Field } from "@/models/field"
import { ZodEnum, ZodString, z, ZodEffects } from "zod"

export function GetNumberValidationSchema(field: Field) {

    let validationSchema: ZodString | ZodEnum<any> | ZodEffects<any> = z.string().transform((value) => parseInt(value))
    if (field.options) {
        if (field.validators.required?.enabled) {
            //@ts-ignore
            validationSchema = z.enum([...field.options.map((f) => f.toString())])
        } else {
            //@ts-ignore
            validationSchema = z.enum([...field.options.map((f) => f.toString()), ""])
        }
    } else {
        if (field.validators.required?.enabled) validationSchema = validationSchema.pipe(z.number()).transform((value) => value)
        if (field.validators.maxValue?.enabled) validationSchema = validationSchema.pipe(z.number().max(field.validators.maxValue.max)).transform((value) => value)
        if (field.validators.minValue?.enabled) validationSchema = validationSchema.pipe(z.number().min(field.validators.minValue.min)).transform((value) => value)
    }
    return validationSchema;
}

export function ValidateNumberFieldValue(field: Field, value: number | undefined) {
    const validationSchema = GetNumberValidationSchema(field);
    return ValidateNumberValue(validationSchema, value)
}

export function ValidateNumberValue(validationSchema: ZodString | ZodEnum<any> | ZodEffects<any>, value: number | undefined) {
    return validationSchema.safeParse((`${value === undefined ? "" : value}`))
}