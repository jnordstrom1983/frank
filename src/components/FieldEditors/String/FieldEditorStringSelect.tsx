"use client"
import TextInput from "@/components/TextInput";
import React from "react";
import { ZodEnum, ZodString } from "zod";

export function FieldEditorStringSelect({
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
    validationSchema: ZodString | ZodEnum<any>
    options: string[]
    showValidation: boolean
}) {
    return <TextInput value={value} showValidation={showValidation} type="select" description={description} options={options.map(item => ({ key: item, text: item }))} subject={subject} validate={validationSchema} onChange={onChange}></TextInput>
}

