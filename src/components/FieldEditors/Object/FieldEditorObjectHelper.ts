import { Field } from "@/models/field"
import { ZodEnum, ZodString, z, ZodEffects, ZodObject, ZodArray, infer } from "zod"

export function GetObjectValidationSchema(field: Field) {

    let validationSchema = z.record(z.string(), z.string())
    return validationSchema;


}


export function ValidateObjectFieldValue(field: Field, value: { [key: string]: string } | undefined) {
    const validationSchema = GetObjectValidationSchema(field);
    return ValidateObjectValue(validationSchema, value)
}

export function ValidateObjectValue(validationSchema: z.ZodRecord<ZodString, ZodString>, value: { [key: string]: string } | undefined) {
    return validationSchema.safeParse(value)
}