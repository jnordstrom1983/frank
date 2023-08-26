"use client"
import TextInput from "@/components/TextInput";
import React from "react";
import { ZodEffects, ZodEnum, ZodString } from "zod";

export function FieldEditorNumberTextbox({
    value,
    subject,
    description,
    onChange,
    validationSchema,
    showValidation
}: {
    value: string
    subject: string
    description: string
    onChange: (value: string) => void
    validationSchema: ZodString | ZodEnum<any> | ZodEffects<any>
    showValidation: boolean
}) {
    return <TextInput value={value} subject={subject} description={description} showValidation={showValidation} validate={validationSchema} onChange={onChange}></TextInput>
}

