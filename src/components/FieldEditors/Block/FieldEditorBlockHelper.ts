import { Field } from "@/models/field"
import { ZodOptional, z } from "zod"

export function GetBlockValidationSchema(field: Field) {
    return z.array(z.object({})).optional()
}

export function ValidateBlockFieldValue(field: Field, value: any | undefined) {
    const validationSchema = GetBlockValidationSchema(field)
    return ValidateBlockValue(validationSchema, value)
}

export function ValidateBlockValue(validationSchema: ZodOptional<z.ZodArray<z.ZodObject<any>>>, value: any | undefined) {
    return validationSchema.safeParse(value)
}
