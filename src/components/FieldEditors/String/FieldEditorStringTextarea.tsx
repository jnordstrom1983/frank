"use client"
import TextInput from "@/components/TextInput";
import React from "react";
import { ZodEnum, ZodString } from "zod";

export function FieldEditorStringTextarea({
    value,
    subject,
    description,
    onChange,
    validationSchema,
    showValidation,
}: {
    value: string
    subject: string
    description: string
    onChange: (value: string) => void
    validationSchema: ZodString | ZodEnum<any>
    showValidation: boolean
}) {
    return <TextInput type="textarea" value={value} showValidation={showValidation} subject={subject} description={description} validate={validationSchema} onChange={onChange}></TextInput>
}

