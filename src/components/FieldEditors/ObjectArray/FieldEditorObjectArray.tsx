
"use client"
import { ObjectProperty } from "@/components/ObjectPropertyEditor"
import TextInput from "@/components/TextInput"
import { Field } from "@/models/field"
import { Box, Button, HStack, Menu, MenuButton, MenuItem, MenuList, Table, Tbody, Td, Th, Tr, VStack } from "@chakra-ui/react"
import { useEffect, useRef, useState } from "react"
import { FieldEditorNotImplementedYet } from "../FieldEditorNotImplementedYet"
import { MinusCircle, PlusCircle, Trash } from "react-feather"
import shortUUID from "short-uuid"

export function FieldEditorObjectArray({ value, field, onChange }: { value: any; field: Field; onChange: (value: { [key: string]: string }[] | undefined) => void; }) {
    const [internalValue, setInternalValue] = useState<{ [key: string]: string }[] | undefined>([])

    const properties: ObjectProperty[] = field.settings.find(s => s.id === "properties")?.value || []

    useEffect(() => {
        setInternalValue(value || [])
    }, [value])

    function internalOnChange(value: { [key: string]: string }[]) {
        console.log("Changed,", value)
        setInternalValue(value)
        onChange(value)
    }
    if (field.dataTypeVariantId === "objects") {
        return (
            <VStack alignItems={"flex-start"} w="100%">
                <Box>{field.name}</Box>
                {field.description && (
                    <Box color="gray.400" fontStyle="italic">
                        {field.description}
                    </Box>
                )}
                <Box w="100%">
                    <ObjectArrayEditor
                        value={value as { [key: string]: string }[]}
                        onChange={internalOnChange} properties={properties}
                    ></ObjectArrayEditor>
                </Box>
            </VStack>
        )
    }




    return <FieldEditorNotImplementedYet name={field.name} dataTypeId={field.dataTypeId} dataTypeVariantId={field.dataTypeVariantId}></FieldEditorNotImplementedYet>
}


export function ObjectArrayEditor({ value, onChange, properties }: { value: { [key: string]: string }[], onChange: (value: { [key: string]: string }[]) => void, properties: ObjectProperty[] }) {

    const [internalValue, setInternalValue] = useState<{ [key: string]: string }[]>(value || []);

    useEffect(() => {
        setInternalValue(value || [])
    }, [value])

    const containerRef = useRef<HTMLDivElement>(null)
    const containerWidth = "650px" || containerRef.current?.offsetWidth || 0

    return <HStack w="100%">
        <Box ref={containerRef} overflowX="hidden" >
            <Box overflowX="auto" width={containerWidth}>
                <Table>

                    <Tbody>
                        <Tr>
                            {properties.map((p, cellIndex) => {
                                return <Th id="header_${p.key}"
                                    borderTopWidth="1px" borderTopColor="grey.100" borderTopStyle="solid"
                                    borderLeftWidth={cellIndex === 0 ? "1px" : undefined} borderLeftColor={cellIndex === 0 ? "grey.100" : undefined} borderLeftStyle={cellIndex === 0 ? "solid" : undefined}
                                    borderRightWidth="1px" borderRightColor="grey.100" borderRightStyle="solid"
                                >{p.key}</Th>
                            })}
                            <Th borderRightWidth="1px" borderRightColor="grey.100" borderRightStyle="solid" borderTopWidth="1px" borderTopColor="grey.100" borderTopStyle="solid"></Th>
                        </Tr>
                        {internalValue.map(obj => {
                            return <Tr key={obj.id}>
                                {properties.map((p, cellIndex) => {

                                    return <Td key={`${obj.id}_${p.key}`}
                                        width="auto"
                                        minWidth="150px"
                                        padding={1}
                                        borderRightWidth="1px" borderRightColor="grey.100" borderRightStyle="solid"
                                        borderLeftWidth={cellIndex === 0 ? "1px" : undefined} borderLeftColor={cellIndex === 0 ? "grey.100" : undefined} borderLeftStyle={cellIndex === 0 ? "solid" : undefined}

                                    ><TextInput key={p.id} value={obj[p.key] || ""} type={p.options.length === 0 ? "text" : "select"} onChange={(value) => {
                                        const updatedValue = [...internalValue]
                                        const index = updatedValue.findIndex(p => p.id === obj.id)
                                        updatedValue[index][p.key] = value;
                                        setInternalValue(updatedValue);
                                        onChange(updatedValue);
                                    }} options={p.options.map(o => ({ key: o, text: o }))}></TextInput>
                                    </Td>



                                })}
                                <Td width="60px" borderRightWidth="1px" borderRightColor="grey.100" borderRightStyle="solid">



                                    <Menu placement="auto-end">
                                        {({ isOpen }) => (
                                            <>
                                                <MenuButton isActive={isOpen} as={Button} variant={"ghost"}>
                                                    <MinusCircle size={"16px"}></MinusCircle>
                                                </MenuButton>

                                                <MenuList>
                                                    <MenuItem
                                                        color="red.500"
                                                        onClick={async () => {

                                                            const updatedValue = [...internalValue].filter(r => r.id !== obj.id)
                                                            setInternalValue(updatedValue);
                                                            onChange(updatedValue);

                                                        }}
                                                    >
                                                        Delete object
                                                    </MenuItem>
                                                </MenuList>
                                            </>
                                        )}
                                    </Menu>


                                </Td>
                            </Tr>


                        })}
                        <Tr>
                            {properties.map((p, cellIndex) => {
                                return <Td id="footer_${p.key}" borderLeftWidth={cellIndex === 0 ? "1px" : undefined} borderLeftColor={cellIndex === 0 ? "grey.100" : undefined} borderLeftStyle={cellIndex === 0 ? "solid" : undefined} borderRightWidth="1px" borderRightColor="grey.100" borderRightStyle="solid"></Td>
                            })}
                            <Td id="footer_add" borderRightWidth="1px" borderRightColor="grey.100" width="50px" borderRightStyle="solid">
                                <Button variant="ghost" title="Add object" onClick={() => {
                                    const updatedValue = [...internalValue, { id: shortUUID.generate() }];
                                    setInternalValue(updatedValue);
                                    onChange(updatedValue);
                                }}><PlusCircle size={"16px"}></PlusCircle></Button>
                            </Td>
                        </Tr>

                    </Tbody>
                </Table>
            </Box>
        </Box>

    </HStack>
}
