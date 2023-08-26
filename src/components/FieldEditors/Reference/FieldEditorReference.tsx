"use client"
import { Field } from "@/models/field"
import React, { useEffect, useState } from "react"
import { FieldEditorNotImplementedYet } from "../FieldEditorNotImplementedYet"
import { GetReferenceValidationSchema, ValidateReferenceValue } from "./FieldEditorReferenceHelper"
import { ReferencesEditor } from "./ReferencesEditor"

export function FieldEditorReferece({
    value,
    field,
    onChange,
    onValidation,
    showValidation,
    spaceId,
}: {
    value: any
    field: Field
    onChange: (value: string | undefined) => void
    onValidation: (valid: boolean) => void
    showValidation: boolean
    spaceId: string
}) {
    const [internalValue, setInternalValue] = useState<string[]>([])

    const validationSchema = GetReferenceValidationSchema(field)

    useEffect(() => {
        if (value) {
            if (Array.isArray(value)) {
                setInternalValue(value)
            } else {
                setInternalValue([value])
            }
        } else {
            setInternalValue([])
        }
    }, [value])

    useEffect(() => {
        const result = ValidateReferenceValue(validationSchema, internalValue.length > 0 ? internalValue[0] : undefined)

        if (result.success) {
            onValidation(true)
        } else {
            onValidation(false)
        }
    }, [internalValue])
    function internalOnChange(value: string[]) {
        if (value.length === 0) {
            setInternalValue([])
            onChange(undefined)
            return
        }

        setInternalValue(value)
        onChange(value[0])
    }
    let enableSelect = true
    if (field.settings.find((p) => p.id === "select")) {
        enableSelect = field.settings.find((p) => p.id === "select")?.value as boolean
    }
    let enableCreate = true
    if (field.settings.find((p) => p.id === "create")) {
        enableCreate = field.settings.find((p) => p.id === "create")?.value as boolean
    }
    let enableEdit = false
    if (field.settings.find((p) => p.id === "edit")) {
        enableEdit = field.settings.find((p) => p.id === "edit")?.value as boolean
    }

    if (field.dataTypeVariantId === "reference") {
        return (
            <ReferencesEditor
                spaceId={spaceId}
                value={value}
                multiple={false}
                subject={field.name}
                description={field.description}
                onChange={(value) => {
                    if (value.length > 0) {
                        internalOnChange(value)
                    } else {
                        internalOnChange([])
                    }
                }}
                validationSchema={validationSchema}
                showValidation={showValidation}
                enableSelect={enableSelect}
                enableCreate={enableCreate}
                enableContentEditing={enableEdit}
                contentTypes={(field.settings.find((p) => p.id === "contenttypes")?.value as string[]) || ["__all__"]}
            ></ReferencesEditor>
        )
    }

    return <FieldEditorNotImplementedYet name={field.name} dataTypeId={field.dataTypeId} dataTypeVariantId={field.dataTypeVariantId}></FieldEditorNotImplementedYet>
}
