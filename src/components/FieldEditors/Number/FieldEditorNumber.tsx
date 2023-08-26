
"use client"
import { Field } from "@/models/field"
import React, { useEffect, useState } from "react"
import { FieldEditorNotImplementedYet } from "../FieldEditorNotImplementedYet"
import { GetNumberValidationSchema, ValidateNumberValue } from "./FieldEditorNumberHelper"
import { FieldEditorNumberSelect } from "./FieldEditorNumberSelect"
import { FieldEditorNumberTextbox } from "./FieldEditorNumberTextbox"

export function FieldEditorNumber({ value, field, onChange, onValidation, showValidation }: { value: any; field: Field; onChange: (value: number | undefined) => void; onValidation: (valid: boolean) => void, showValidation: boolean }) {
    const [internalValue, setInternalValue] = useState<number | undefined>(0)



    const validationSchema = GetNumberValidationSchema(field);

    useEffect(() => {
        const parsedValue = parseInt(value || 0);

        setInternalValue(isNaN(parsedValue) ? 0 : parsedValue)
    }, [value])

    useEffect(() => {
        const result = ValidateNumberValue(validationSchema, internalValue);

        if (result.success) {
            onValidation(true)
        } else {
            onValidation(false)
        }
    }, [internalValue])
    function internalOnChange(value: string) {
        if (value === "") {
            setInternalValue(undefined)
            onChange(undefined)
            return;
        }
        const parsedValue = parseInt(value);
        setInternalValue(isNaN(parsedValue) ? 0 : parsedValue)
        onChange(isNaN(parsedValue) ? 0 : parsedValue)
    }
    if (field.dataTypeVariantId === "textbox") {
        return (
            <FieldEditorNumberTextbox
                value={`${value === undefined ? "" : value}`}
                subject={field.name}

                description={field.description}
                onChange={internalOnChange}
                validationSchema={validationSchema}
                showValidation={showValidation}
            ></FieldEditorNumberTextbox>
        )
    }


    if (field.dataTypeVariantId === "select") {
        let options: string[] = field.options?.map(i => i.toString()) || [];

        if (!field.validators.required?.enabled) {
            options = ["", ...options]
        }


        return (
            <FieldEditorNumberSelect
                value={`${value || ""}`}
                subject={field.name}
                description={field.description}
                onChange={internalOnChange}
                validationSchema={validationSchema}
                options={options}
                showValidation={showValidation}
            ></FieldEditorNumberSelect>
        )
    }

    return <FieldEditorNotImplementedYet name={field.name} dataTypeId={field.dataTypeId} dataTypeVariantId={field.dataTypeVariantId}></FieldEditorNotImplementedYet>
}
