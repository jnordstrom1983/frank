"use client"
import TextInput from "@/components/TextInput"
import { Box, Button, HStack, Menu, MenuButton, MenuItem, MenuList, Table, Tbody, Td, Tr } from "@chakra-ui/react"
import React, { useEffect, useRef, useState } from "react"
import { MinusCircle, PlusCircle } from "react-feather"



export function TableEditor({
    data,
    onChange,
    editable = true,
    width,
    internalPadding = 5,
}: {
    editable: boolean
    data: string[][]
    onChange: (data: any) => void
    width?: number
    internalPadding?: number
}) {
    const [internalData, setInternalData] = useState<string[][]>()
    const [updatedData, setUpdatedData] = useState<string[][]>()

    useEffect(() => {
        if (Array.isArray(data)) {
            setInternalData(JSON.parse(JSON.stringify(data)))
            setUpdatedData(data)

        } else {
            setInternalData([["", ""], ["", ""]])
            setUpdatedData([["", ""], ["", ""]])

        }
    }, [data])


    function addRow() {
        if (!updatedData) return;
        const firstRow = updatedData[0];
        let cells = firstRow.map(c => "")
        setUpdatedData([...updatedData, cells])
        setInternalData([...updatedData, cells])
        onChange([...updatedData, cells])
    }
    function addColum() {
        if (!updatedData) return;

        const rows = updatedData.map(row => [...row, ""])
        setUpdatedData(rows)
        setInternalData(rows)
        onChange(rows)
    }
    function deleteRow(index: number) {
        if (!updatedData) return;

        let items = [...updatedData]
        items.splice(index, 1)
        setUpdatedData(items)
        setInternalData(items)
        onChange(items)
    }
    function deleteColumn(index: number) {
        if (!updatedData) return;

        const rows = updatedData.map(row => {
            let columns = [...row]
            columns.splice(index, 1)
            return columns
        })
        setInternalData(rows)
        setUpdatedData(rows)
        onChange(rows)
    }
    useEffect(() => {
        if (!updatedData) return;
        setInternalData(updatedData)
    }, [editable])


    const containerRef = useRef<HTMLDivElement>(null)
    const containerWidth = width || containerRef.current?.offsetWidth || 0
    return (
        internalData ? <HStack w="100%">
            <Box p={internalPadding} ref={containerRef} borderRadius={editable ? 10 : "3px"} overflowX="hidden" >
                <Box overflowX="auto" width={`${editable ? containerWidth - 40 : containerWidth + 130}px`}>
                    <Table>
                        <Tbody>
                            {editable &&
                                <Tr >
                                    {internalData[0].map((cell, cellIndex) => {
                                        return <Td key={`cell_${0}_${cellIndex}`} minW="100px" p={1} textAlign="center" borderTopWidth="1px" borderTopColor="grey.100" borderTopStyle="solid" borderLeftWidth={cellIndex === 0 ? "1px" : undefined} borderLeftColor={cellIndex === 0 ? "grey.100" : undefined} borderLeftStyle={cellIndex === 0 ? "solid" : undefined} borderRightWidth="1px" borderRightColor="grey.100" borderRightStyle="solid">


                                            <Menu placement="auto-end">
                                                {({ isOpen }) => (
                                                    <>
                                                        <MenuButton isDisabled={internalData[0].length < 2} isActive={isOpen} as={Button} variant={"ghost"}>
                                                            <MinusCircle size={"16px"}></MinusCircle>
                                                        </MenuButton>

                                                        <MenuList>
                                                            <MenuItem
                                                                color="red.500"
                                                                onClick={async () => {
                                                                    deleteColumn(cellIndex)
                                                                }}
                                                            >
                                                                Delete column
                                                            </MenuItem>
                                                        </MenuList>
                                                    </>
                                                )}
                                            </Menu>


                                        </Td>
                                    })}
                                    <Td key={`cell_${0}_last`} p={1} textAlign="center" borderTopWidth="1px" borderTopColor="grey.100" borderTopStyle="solid" borderRightWidth="1px" borderRightColor="grey.100" borderRightStyle="solid">
                                        <Button variant="ghost" p={1} height="40px" onClick={addColum} title="Add column"><PlusCircle size={"16px"}></PlusCircle></Button>
                                    </Td>
                                </Tr>
                            }

                            {internalData.map((row, rowIndex) => {
                                return <Tr key={`row_${rowIndex}`}  >
                                    {row.map((cell, cellIndex) => {
                                        return <Td width="auto" padding={editable ? 1 : 3} key={`cell_${row}_${cellIndex}`} borderTopWidth={rowIndex === 0 ? "1px" : undefined} borderTopColor={rowIndex === 0 ? "grey.100" : undefined} borderTopStyle={rowIndex === 0 ? "solid" : undefined} borderLeftWidth={cellIndex === 0 ? "1px" : undefined} borderLeftColor={cellIndex === 0 ? "grey.100" : undefined} borderLeftStyle={cellIndex === 0 ? "solid" : undefined} borderRightWidth="1px" borderRightColor="grey.100" borderRightStyle="solid">

                                            {editable ? <TextInput value={cell} onChange={(value) => {
                                                if (!updatedData) return;
                                                const data = JSON.parse(JSON.stringify(updatedData))
                                                data[rowIndex][cellIndex] = value
                                                setUpdatedData(data)
                                                onChange(data)
                                            }}></TextInput> : updatedData ? updatedData[rowIndex][cellIndex] : ""}

                                        </Td>
                                    })

                                    }

                                    {editable &&
                                        <Td textAlign="center" p={1} width="40px" borderRightWidth="1px" borderRightColor="grey.100" borderRightStyle="solid" padding={3}>




                                            <Menu placement="auto-end">
                                                {({ isOpen }) => (
                                                    <>
                                                        <MenuButton isDisabled={internalData.length < 2} isActive={isOpen} as={Button} variant={"ghost"}>
                                                            <MinusCircle size={"16px"}></MinusCircle>
                                                        </MenuButton>

                                                        <MenuList>
                                                            <MenuItem
                                                                color="red.500"
                                                                onClick={async () => {
                                                                    deleteRow(rowIndex)
                                                                }}
                                                            >
                                                                Delete row
                                                            </MenuItem>
                                                        </MenuList>
                                                    </>
                                                )}
                                            </Menu>


                                        </Td>
                                    }

                                </Tr>
                            })}

                            {editable && <Tr>
                                {internalData[0].map((cell, cellIndex) => {
                                    return <Td key={`cell_last_${cellIndex}`} p={1} textAlign="center" borderTopWidth="1px" borderTopColor="grey.100" borderTopStyle="solid" borderLeftWidth={cellIndex === 0 ? "1px" : undefined} borderLeftColor={cellIndex === 0 ? "grey.100" : undefined} borderLeftStyle={cellIndex === 0 ? "solid" : undefined} borderRightWidth="1px" borderRightColor="grey.100" borderRightStyle="solid">

                                    </Td>
                                })}
                                <Td key={`cell_last_last`} p={1} textAlign="center" borderTopWidth="1px" borderTopColor="grey.100" borderTopStyle="solid" borderRightWidth="1px" borderRightColor="grey.100" borderRightStyle="solid">
                                    <Button variant="ghost" p={1} onClick={addRow} height="40px" title="Add row"><PlusCircle size={"16px"}></PlusCircle></Button>
                                </Td>
                            </Tr>}


                        </Tbody>
                    </Table>
                </Box>

            </Box>
        </HStack> : <></>
    )
}
