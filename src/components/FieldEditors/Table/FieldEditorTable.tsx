
"use client"
import { TableEditor } from "@/components/TableEditor"
import { Field } from "@/models/field"
import { Box, VStack } from "@chakra-ui/react"
import React, { useEffect, useState } from "react"
import { FieldEditorNotImplementedYet } from "../FieldEditorNotImplementedYet"
import { GetTableValidationSchema, ValidateTableValue } from "./FieldEditorTableHelper"

export function FieldEditorTable({ value, field, onChange }: { value: any; field: Field; onChange: (value: string[][] | undefined) => void; }) {
    const [internalValue, setInternalValue] = useState<string[][] | undefined>([[""]])



    const validationSchema = GetTableValidationSchema(field);

    useEffect(() => {
        setInternalValue(value)
    }, [value])

    // useEffect(() => {
    //     const result = ValidateTableValue(validationSchema, internalValue);

    //     if (result.success) {
    //         onValidation(true)
    //     } else {
    //         onValidation(false)
    //     }
    // }, [internalValue])
    function internalOnChange(value: string[][]) {

        setInternalValue(value)
        onChange(value)
    }
    if (field.dataTypeVariantId === "table") {
        return (
            <VStack alignItems={"flex-start"} w="100%">
                <Box>{field.name}</Box>
                {field.description && (
                    <Box color="gray.400" fontStyle="italic">
                        {field.description}
                    </Box>
                )}
                <Box w="100%">
                    <TableEditor
                        data={value as string[][]}
                        onChange={internalOnChange} editable={true}
                        width={650}
                        internalPadding={0}
                    ></TableEditor>
                </Box>
            </VStack>
        )
    }




    return <FieldEditorNotImplementedYet name={field.name} dataTypeId={field.dataTypeId} dataTypeVariantId={field.dataTypeVariantId}></FieldEditorNotImplementedYet>
}
