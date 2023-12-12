"use client"
import { OptionsEditor } from "@/components/OptionsEditor"
import { Field } from "@/models/field"
import { useEffect, useState } from "react"
import { FieldEditorNotImplementedYet } from "../FieldEditorNotImplementedYet"
import { GetStringArrayValidationSchema } from "./FieldEditorStringArrayHelper"
import { Box, VStack } from "@chakra-ui/react"
import { CheckboxList } from "@/components/CheckboxList"

export function FieldEditorStringArray({
    value,
    field,
    onChange,
    onValidation,
    showValidation,
}: {
    value: any
    field: Field
    onChange: (value: string[]) => void
    onValidation: (valid: boolean) => void
    showValidation: boolean
}) {
    const [internalValue, setInternalValue] = useState<string[]>([])

    const [initialValue, setInitialValue] = useState<string[]>(value || [])
    const validationSchema = GetStringArrayValidationSchema(field)

    const [internalErrors, setInternalErrors] = useState<string[]>([])


    useEffect(() => {
        setInternalValue(value || [])
        setInitialValue(value || [])
    }, [value])

    useEffect(() => {
        const result = validationSchema.safeParse(internalValue)
        if (result.success) {
            onValidation(true)
            setInternalErrors([])
        } else {
            onValidation(false)
            setInternalErrors(result.error.errors.map((e: any) => e.message))
        }
    }, [internalValue])
    function internalOnChange(value: string[]) {
        setInternalValue(value)
        onChange(value)
    }
    if (field.dataTypeVariantId === "tags") {
        return (
            <VStack alignItems={"flex-start"} w="100%">
                <Box>{field.name}</Box>
                {showValidation && internalErrors.map((e) => (
                    <Box key={e} bg="red.400" color="white" padding="3px" borderRadius="3px" fontSize="12px">
                        {e}
                    </Box>
                ))}

                {field.description && (
                    <Box color="gray.400" fontStyle="italic">
                        {field.description}
                    </Box>
                )}
                <Box w="100%">
                    {field.options ? (
                        <CheckboxList options={ (field.options as string[]).map(v=>({text : v, key : v}))} value={internalValue || []} onChange={internalOnChange}></CheckboxList>
                    ) : (
                        <OptionsEditor options={initialValue} type={"string"} onChange={(v) => internalOnChange(v as string[])} placeHolder="Enter a value and press enter" countUnsubmittedValue={true}></OptionsEditor>
                    )}
                </Box>
            </VStack>
        )
    }

    return <FieldEditorNotImplementedYet name={field.name} dataTypeId={field.dataTypeId} dataTypeVariantId={field.dataTypeVariantId}></FieldEditorNotImplementedYet>
}
