
"use client"
import { FieldEditorStringSelect } from "@/components/FieldEditors/String/FieldEditorStringSelect"
import { FieldEditorStringTextbox } from "@/components/FieldEditors/String/FieldEditorStringTextbox"
import { Field } from "@/models/field"
import React, { useEffect, useState } from "react"
import { FieldEditorNotImplementedYet } from "../FieldEditorNotImplementedYet"
import { GetStringValidationSchema } from "./FieldEditorStringHelper"
import { FieldEditorStringTextarea } from "./FieldEditorStringTextarea"

export function FieldEditorString({ value, field, onChange, onValidation, showValidation }: { value: any; field: Field; onChange: (value: string) => void; onValidation: (valid: boolean) => void, showValidation: boolean }) {
    const [internalValue, setInternalValue] = useState<string>("")

    const [initialValue, setInitialValue] = useState<string>(value)
    const validationSchema = GetStringValidationSchema(field);

    useEffect(() => {
        setInitialValue(value)
    }, [value])

    useEffect(() => {
        setInternalValue(`${value || ""}`)


        //Default value support

        if (field.dataTypeVariantId === "select") {
            if (!value) {
                setTimeout(() => {

                    let options: string[] = field.options?.map(i => i.toString()) || [];
                    let newValue = "";
                    if (field.settings.find(p => p.id === "defaultValue")?.value) {
                        const dv = field.settings.find(p => p.id === "defaultValue")?.value;
                        const opt = options.find(p => p === dv);
                        if (opt) {
                            newValue = opt;
                        }
                    } else {
                        if (field.validators.required?.enabled) {
                            newValue = options[0]
                        }
                    }
                    if (newValue) {
                        setInternalValue(newValue)
                        setInitialValue(newValue)
                        onChange && onChange(newValue)
                    }





                }, 1)
            }
        } else {
            if (!value && field.settings.find(p => p.id === "defaultValue")?.value) {
                setTimeout(() => {
                    const newValue = field.settings.find(p => p.id === "defaultValue")?.value
                    setInternalValue(newValue)
                    setInitialValue(newValue)
                    onChange && onChange(newValue)
                }, 1)
            }
        }





    }, [value])

    useEffect(() => {
        const result = validationSchema.safeParse(internalValue)
        if (result.success) {
            onValidation(true)
        } else {
            onValidation(false)
        }
    }, [internalValue])
    function internalOnChange(value: string) {
        setInternalValue(value)
        onChange(value)
    }
    if (field.dataTypeVariantId === "textbox") {
        return (
            <FieldEditorStringTextbox
                value={`${initialValue || ""}`}
                subject={field.name}
                description={field.description}
                onChange={internalOnChange}
                validationSchema={validationSchema}
                showValidation={showValidation}

            ></FieldEditorStringTextbox>
        )
    }
    if (field.dataTypeVariantId === "textarea") {
        return (
            <FieldEditorStringTextarea
                value={`${initialValue || ""}`}
                subject={field.name}
                description={field.description}
                showValidation={showValidation}
                onChange={internalOnChange}
                validationSchema={validationSchema}
            ></FieldEditorStringTextarea>
        )
    }

    if (field.dataTypeVariantId === "select") {
        let options: string[] = field.options?.map(i => i.toString()) || [];

        if (!field.validators.required?.enabled) {
            options = ["", ...options]
        }


        return (
            <FieldEditorStringSelect
                value={`${initialValue || ""}`}
                subject={field.name}
                description={field.description}
                showValidation={showValidation}
                onChange={internalOnChange}
                validationSchema={validationSchema}
                options={options}
            ></FieldEditorStringSelect>
        )
    }

    return <FieldEditorNotImplementedYet name={field.name} dataTypeId={field.dataTypeId} dataTypeVariantId={field.dataTypeVariantId}></FieldEditorNotImplementedYet>
}
