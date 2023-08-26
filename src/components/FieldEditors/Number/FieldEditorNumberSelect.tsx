"use client"
import TextInput from "@/components/TextInput";
import React from "react";
import { ZodEffects, ZodEnum, ZodString } from "zod";

export function FieldEditorNumberSelect({
    value,
    subject,
    description,
    onChange,
    validationSchema,
    options,
    showValidation,
}: {
    value: string
    subject: string
    description: string
    onChange: (value: string) => void
    validationSchema: ZodString | ZodEnum<any> | ZodEffects<any>
    options: string[]
    showValidation: boolean
}) {
    return <TextInput value={value} type="select" description={description} showValidation={showValidation} options={options.map(item => ({ key: item, text: item }))} subject={subject} validate={validationSchema} onChange={onChange}></TextInput>
}

