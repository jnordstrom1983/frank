"use client"
import TextInput from "@/components/TextInput"
import { Field } from "@/models/field"
import { useEffect, useState } from "react"
import { FieldEditorNotImplementedYet } from "../FieldEditorNotImplementedYet"
import { GetBooleanValidationSchema, ValidateBooleanValue } from "./FieldEditorBooleanHelper"

export function FieldEditorBoolean({
    value,
    field,
    onChange,
    onValidation,
    showValidation,
}: {
    value: any
    field: Field
    onChange: (value: boolean | undefined) => void
    onValidation: (valid: boolean) => void
    showValidation: boolean
}) {
    const [internalValue, setInternalValue] = useState<boolean | undefined>(false)

    const validationSchema = GetBooleanValidationSchema(field)

    useEffect(() => {
        setInternalValue(value === true || false)
    }, [value])

    useEffect(() => {
        const result = ValidateBooleanValue(validationSchema, internalValue)
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
            return
        }

        const parsedValue = value === "true"
        setInternalValue(parsedValue)
        onChange(parsedValue)
    }

    if (field.dataTypeVariantId === "select") {
        let options: string[] = ["true", "false"]

        if (!field.validators.required?.enabled) {
            options = ["", ...options]
        }

        return (
            <TextInput
                value={`${value === undefined ? "" : value}`}
                type="select"
                description={field.description}
                showValidation={showValidation}
                options={options.map((item) => ({ key: item, text: item }))}
                subject={field.name}
                validate={validationSchema}
                onChange={internalOnChange}
            ></TextInput>
        )
    }

    return <FieldEditorNotImplementedYet name={field.name} dataTypeId={field.dataTypeId} dataTypeVariantId={field.dataTypeVariantId}></FieldEditorNotImplementedYet>
}
