
"use client"
import { ObjectProperty } from "@/components/ObjectPropertyEditor"
import TextInput from "@/components/TextInput"
import { Field } from "@/models/field"
import { Box, Table, Td, Th, Tr, VStack } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { FieldEditorNotImplementedYet } from "../FieldEditorNotImplementedYet"

export function FieldEditorObject({ value, field, onChange }: { value: any; field: Field; onChange: (value: { [key: string]: string } | undefined) => void; }) {
    const [internalValue, setInternalValue] = useState<{ [key: string]: string } | undefined>({})

    const properties: ObjectProperty[] = field.settings.find(s => s.id === "properties")?.value || []

    useEffect(() => {
        setInternalValue(value || {})
    }, [value])

    function internalOnChange(value: { [key: string]: string }) {
        setInternalValue(value)
        onChange(value)
    }
    if (field.dataTypeVariantId === "object") {
        return (
            <VStack alignItems={"flex-start"} w="100%">
                <Box>{field.name}</Box>
                {field.description && (
                    <Box color="gray.400" fontStyle="italic">
                        {field.description}
                    </Box>
                )}
                <Box w="100%">
                    <ObjectEditor
                        value={value as { [key: string]: string }}
                        onChange={internalOnChange} properties={properties}
                    ></ObjectEditor>
                </Box>
            </VStack>
        )
    }




    return <FieldEditorNotImplementedYet name={field.name} dataTypeId={field.dataTypeId} dataTypeVariantId={field.dataTypeVariantId}></FieldEditorNotImplementedYet>
}


export function ObjectEditor({ value, onChange, properties }: { value: { [key: string]: string }, onChange: (value: { [key: string]: string }) => void, properties: ObjectProperty[] }) {

    const [internalValue, setInternalValue] = useState<{ [key: string]: string }>(value || {});

    useEffect(() => {
        setInternalValue(value || {})
    }, [value])


    return <Table>

        {properties.map((p, rowIndex) => {

            return <Tr><Th
                borderTopWidth={rowIndex === 0 ? "1px" : undefined} borderTopColor={rowIndex === 0 ? "grey.100" : undefined} borderTopStyle={rowIndex === 0 ? "solid" : undefined}

                borderRightWidth="1px" borderRightColor="grey.100" borderRightStyle="solid"
                borderLeftWidth="1px" borderLeftColor="grey.100" borderLeftStyle="solid"
            >{p.key}</Th><Td
                borderTopWidth={rowIndex === 0 ? "1px" : undefined} borderTopColor={rowIndex === 0 ? "grey.100" : undefined} borderTopStyle={rowIndex === 0 ? "solid" : undefined}

                borderRightWidth="1px" borderRightColor="grey.100" borderRightStyle="solid"
            ><TextInput key={p.id} value={internalValue[p.key] || ""} type={p.options.length === 0 ? "text" : "select"} onChange={(value) => {
                const updatedValue = { ...internalValue }
                updatedValue[p.key] = value;
                setInternalValue(updatedValue);
                onChange(updatedValue);
            }} options={p.options.map(o => ({ key: o, text: o }))}></TextInput></Td></Tr>



        })}
    </Table>
}
