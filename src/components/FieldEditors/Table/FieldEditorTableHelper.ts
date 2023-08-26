import { Field } from "@/models/field"
import { ZodEnum, ZodString, z, ZodEffects, ZodObject, ZodArray } from "zod"

export function GetTableValidationSchema(field: Field) {

    let validationSchema: ZodArray<ZodArray<ZodString>> = z.array(z.array(z.string()))
    return validationSchema;
}

export function ValidateTableFieldValue(field: Field, value: string[][] | undefined) {
    const validationSchema = GetTableValidationSchema(field);
    return ValidateTableValue(validationSchema, value)
}

export function ValidateTableValue(validationSchema: ZodArray<ZodArray<ZodString>>, value: string[][] | undefined) {
    return validationSchema.safeParse(value)
}