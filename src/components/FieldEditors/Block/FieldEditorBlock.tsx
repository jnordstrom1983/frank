"use client"
import { Field } from "@/models/field"
import { Box, VStack } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { FieldEditorNotImplementedYet } from "../FieldEditorNotImplementedYet"
import { BlockEditor } from "./BlockEditor"
import { GetBlockValidationSchema } from "./FieldEditorBlockHelper"

export function FieldEditorBlock({ value, field, onChange, spaceId }: { value: any; field: Field; onChange: (value: any | undefined) => void; spaceId: string }) {
    const [internalValue, setInternalValue] = useState<any | undefined>()

    const validationSchema = GetBlockValidationSchema(field)

    useEffect(() => {
        const parsedValue = parseInt(value || 0)

        setInternalValue(value)
    }, [value])

    function internalOnChange(value: any) {
        setInternalValue(value)
        onChange(value)
    }
    if (field.dataTypeVariantId === "array") {
        return (
            <VStack alignItems={"flex-start"} w="100%">
                <Box>{field.name}</Box>
                {field.description && (
                    <Box color="gray.400" fontStyle="italic">
                        {field.description}
                    </Box>
                )}
                <Box w="100%">
                    <BlockEditor blockTypes={field.settings.find(p => p.id === "blocktypes")?.value || []} blocks={value} onChange={internalOnChange} spaceId={spaceId}></BlockEditor>
                </Box>
            </VStack>
        )
    }

    return <FieldEditorNotImplementedYet name={field.name} dataTypeId={field.dataTypeId} dataTypeVariantId={field.dataTypeVariantId}></FieldEditorNotImplementedYet>
}
