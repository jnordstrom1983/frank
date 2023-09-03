import { Field } from "@/models/field"
import { ZodEnum, ZodString, z, ZodEffects, ZodObject, ZodArray, infer } from "zod"

export function GetObjectArrayValidationSchema(field: Field) {
    let validationSchema = z.array(z.record(z.string(), z.string()))
    return validationSchema;
}


export function ValidateObjectArrayFieldValue(field: Field, value: { [key: string]: string }[] | undefined) {
    const validationSchema = GetObjectArrayValidationSchema(field);
    return ValidateObjectArrayValue(validationSchema, value)
}

export function ValidateObjectArrayValue(validationSchema: z.ZodArray<z.ZodRecord<ZodString, ZodString>>, value: { [key: string]: string }[] | undefined) {
    return validationSchema.safeParse(value)
}