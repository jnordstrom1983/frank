
"use client"
import { Field } from "@/models/field"
import React, { useEffect, useState } from "react"
import { FieldEditorNotImplementedYet } from "../FieldEditorNotImplementedYet"
import { GetAssetArrayValidationSchema, ValidateAssetArrayValue } from "./FieldEditorAssetHelper"
import { AssetEditor } from "../Asset/AssetEditor"


export function FieldEditorAssetArray({
    value,
    field,
    onChange,
    onValidation,
    showValidation,
    spaceId,
}: {
    value: any
    field: Field
    onChange: (value: string[] | undefined) => void
    onValidation: (valid: boolean) => void
    showValidation: boolean
    spaceId: string
}) {
    const [internalValue, setInternalValue] = useState<string[]>([])

    const validationSchema = GetAssetArrayValidationSchema(field)

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
        const result = ValidateAssetArrayValue(validationSchema, internalValue.length > 0 ? internalValue : undefined)
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
        onChange(value)
    }
    let enableSelect = true
    if (field.settings.find((p) => p.id === "select")) {
        enableSelect = field.settings.find((p) => p.id === "select")?.value as boolean
    }
    let enableCreate = true
    if (field.settings.find((p) => p.id === "create")) {
        enableCreate = field.settings.find((p) => p.id === "create")?.value as boolean
    }

    let imageWith: number | undefined = undefined;
    if (field.settings.find((p) => p.id === "width")) {
        imageWith = field.settings.find((p) => p.id === "width")?.value as number
    }

    let imageHeight: number | undefined = undefined;
    if (field.settings.find((p) => p.id === "height")) {
        imageHeight = field.settings.find((p) => p.id === "height")?.value as number
    }

    let type: "file" | "image" = "file"
    if (field.settings.find((p) => p.id === "image")) {
        const onlyImage = field.settings.find((p) => p.id === "image")?.value as boolean;
        if (onlyImage) type = "image"
    }


    if (field.dataTypeVariantId === "asset") {
        return (
            <AssetEditor
                spaceId={spaceId}
                value={value}
                multiple={true}
                subject={field.name}
                description={field.description}
                onChange={(value) => {
                    if (value.length > 0) {
                        internalOnChange(value)
                    } else {
                        internalOnChange([])
                    }
                }}
                type={type}
                validationSchema={validationSchema}
                showValidation={showValidation}
                enableSelect={enableSelect}
                enableCreate={enableCreate}
                imageWidth={imageWith}
                imageHeight={imageHeight}

            ></AssetEditor>
        )
    }

    return <FieldEditorNotImplementedYet name={field.name} dataTypeId={field.dataTypeId} dataTypeVariantId={field.dataTypeVariantId}></FieldEditorNotImplementedYet>
}
