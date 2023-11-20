import { Field } from "@/models/field"
import { ZodEnum, ZodString, z, ZodEffects, ZodArray } from "zod"

export function GetStringArrayValidationSchema(field: Field) {
    let validationSchema = z.array(z.string())
    if(field.options){
        if (field.validators.required?.enabled) {
            //@ts-ignore
            validationSchema = z.array(z.enum([...field.options.map((f) => f.toString())]))
        } else {
            //@ts-ignore
            validationSchema = z.array(z.enum([...field.options.map((f) => f.toString()), ""]))
        }    
    }else{
        if(field.validators.required?.enabled){
            validationSchema = z.array(z.string()).min(1);
        }

    }
    
    return validationSchema

}

export function ValidateStringArrayFieldValue(field: Field, value: string[] | undefined) {
    
    const validationSchema = GetStringArrayValidationSchema(field);
    return ValidateStringArrayValue(validationSchema, value)
}

export function ValidateStringArrayValue(validationSchema: ZodArray<ZodString>, value: string[] | undefined) {
    console.log("validating", value)
    return validationSchema.safeParse(value === undefined ? [] : value)
}