"use client"
import { Field } from "@/models/field"
import React, { useEffect, useState } from "react"
import { FieldEditorNotImplementedYet } from "../FieldEditors/FieldEditorNotImplementedYet"
import { FieldEditorNumber } from "../FieldEditors/Number/FieldEditorNumber"
import { FieldEditorString } from "../FieldEditors/String/FieldEditorString"
import { FieldEditorReferece } from "../FieldEditors/Reference/FieldEditorReference"
import { FieldEditorRefereceArray } from "../FieldEditors/ReferenceArray/FieldEditorReferenceArray"
import { FieldEditorBlock } from "../FieldEditors/Block/FieldEditorBlock"
import { FieldEditorTable } from "../FieldEditors/Table/FieldEditorTable"
import { FieldEditorAsset } from "../FieldEditors/Asset/FieldEditorAsset"
import { FieldEditorAssetArray } from "../FieldEditors/AssetArray/FieldEditorAssetArray"




export function ContentEditorField({ spaceId, field, data, onDataChange, showValidation, onValidation }: { spaceId: string, field: Field, data: Record<string, any>, onDataChange: (fieldId: string, data: any) => void, showValidation: boolean, onValidation: (valid: boolean) => void }) {
    const [fieldValue, setFieldValue] = useState<any>(data[field.fieldId])

    useEffect(() => {
        setFieldValue(data[field.fieldId])
    }, [data])


    if (field.dataTypeId === "string") {
        return <FieldEditorString value={fieldValue} field={field} showValidation={showValidation} onChange={(value) => onDataChange(field.fieldId, value)} onValidation={onValidation} key={field.fieldId}></FieldEditorString>
    }
    if (field.dataTypeId === "number") {
        return <FieldEditorNumber value={fieldValue} field={field} showValidation={showValidation} onChange={(value) => onDataChange(field.fieldId, value)} onValidation={onValidation} key={field.fieldId}></FieldEditorNumber>
    }
    if (field.dataTypeId === "reference") {
        return <FieldEditorReferece value={fieldValue} spaceId={spaceId} field={field} showValidation={showValidation} onChange={(value) => onDataChange(field.fieldId, value)} onValidation={onValidation} key={field.fieldId}></FieldEditorReferece>
    }
    if (field.dataTypeId === "referenceArray") {
        return <FieldEditorRefereceArray value={fieldValue} spaceId={spaceId} field={field} showValidation={showValidation} onChange={(value) => onDataChange(field.fieldId, value)} onValidation={onValidation} key={field.fieldId}></FieldEditorRefereceArray>
    }
    if (field.dataTypeId === "blocks") {
        return <FieldEditorBlock value={fieldValue} spaceId={spaceId} field={field} onChange={(value) => onDataChange(field.fieldId, value)} key={field.fieldId}></FieldEditorBlock>
    }
    if (field.dataTypeId === "table") {
        return <FieldEditorTable value={fieldValue} field={field} onChange={(value) => onDataChange(field.fieldId, value)} key={field.fieldId} ></FieldEditorTable>
    }
    if (field.dataTypeId === "asset") {
        return <FieldEditorAsset value={fieldValue} field={field} onChange={(value) => onDataChange(field.fieldId, value)} key={field.fieldId} onValidation={onValidation} showValidation={showValidation} spaceId={spaceId} ></FieldEditorAsset>
    }
    if (field.dataTypeId === "assetArray") {
        return <FieldEditorAssetArray value={fieldValue} field={field} onChange={(value) => onDataChange(field.fieldId, value)} key={field.fieldId} onValidation={onValidation} showValidation={showValidation} spaceId={spaceId} ></FieldEditorAssetArray>
    }

    return (
        <FieldEditorNotImplementedYet
            name={field.name}
            dataTypeId={field.dataTypeId}
            dataTypeVariantId={field.dataTypeVariantId}
            key={field.fieldId}
        ></FieldEditorNotImplementedYet>
    )
}