"use client"
import { Field } from "@/models/field"
import { Divider, VStack } from "@chakra-ui/react"
import React from "react"
import { ContentEditorField } from "./ContentEditorField"


export function ContentEditor({
    data,
    fields,
    spaceId,
    onDataChange,
    onValidation,
    showValidation,
}: {
    data: Record<string, any>
    fields: Field[]
    spaceId : string, 
    onValidation: (fieldId: string, valid: boolean) => void
    onDataChange: (fieldId: string, data: any) => void
    showValidation: boolean

}) {
    return (
        <VStack spacing={10} divider={<Divider borderStyle={"dashed"}></Divider>}>
            {fields.map((field) => <ContentEditorField spaceId={spaceId} onValidation={(valid) => onValidation(field.fieldId, valid)} showValidation={showValidation} field={field} data={data} onDataChange={onDataChange} key={field.fieldId}></ContentEditorField>)}
        </VStack>
    )
}