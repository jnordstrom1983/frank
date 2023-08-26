"use client"
import { ContentEditableField } from "@/components/ContentEditableField";
import { Box, HStack, VStack } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import shortUUID from "short-uuid";


export function BlockList({
    variant,
    data,
    onChange,
    selected,
    onDelete,
    onDeselect,
    editorInteracted,
    onAdd
}: {
    selected: boolean
    variant: string
    data: string
    onChange: (data: any) => void
    onDelete: () => void
    onDeselect: () => void
    editorInteracted: boolean,
    onAdd: (blockTypeId: string) => void
}) {
    const [rows, setRows] = useState<{ id: string, text: string }[]>();
    const [selectedRowId, setSelectedRowId] = useState<string>("")
    useEffect(() => {
        if (!Array.isArray(data)) {
            const row = {
                id: shortUUID().generate(),
                text: ""
            }
            setRows([row])
            setSelectedRowId(row.id)
        } else {
            setRows(data)
        }
    }, [data])

    function itemChange(itemId: string, value: string) {

        setRows((rows) => {
            if (!rows) return [];
            const newRows = [...rows]
            const itemIndex = newRows.findIndex(r => r.id === itemId);
            newRows[itemIndex].text = value;

            setTimeout(() => {
                onChange(newRows)
            }, 1)

            setRows(newRows)
            return newRows
        })
    }
    function AddRow(afterItemId: string) {
        try {
            setRows((rows) => {
                if (!rows) return [];
                const index = rows.findIndex(r => r.id === afterItemId);
                const row = {
                    id: shortUUID().generate(),
                    text: ""
                }
                let newRows = [...rows.slice(0, index + 1), row, ...rows.slice(index + 1)]
                setTimeout(() => {
                    onChange(newRows)
                }, 1)

                setSelectedRowId(row.id)
                return newRows;
            })
        } catch (ex) {

        }
    }
    function DeleteRow(itemId: string) {
        if (!rows) return;
        setRows((rows) => {
            if (!rows) return [];
            const rowIndex = rows.findIndex(r => r.id === itemId)

            //Ensure we have one row left
            if (rows[rowIndex].text === "" && rows.length < 2) {
                return rows;
            } else {
                if (rows.length < 2) {
                    rows[rowIndex].text = "";
                    let newRows = [...rows]
                    setTimeout(() => {
                        onChange(newRows)
                    }, 1)
                    return newRows;
                }

            }


            let newRows = [...rows].filter(r => r.id !== itemId);


            const selectedRowIndex = rowIndex - 1
            if (selectedRowIndex > -1) {
                let newSelectedRow = rows[selectedRowIndex]
                setSelectedRowId(newSelectedRow.id)
            }
            if (newRows.length === 0) {
                const row = {
                    id: shortUUID().generate(),
                    text: ""
                }
                newRows = [row];
                setSelectedRowId(row.id)

            }
            setTimeout(() => {
                onChange(newRows)
            }, 1)




            return newRows

        })
    }
    return (
        rows ? (
            <Box flex={1} backgroundColor={selected ? "#F5F5F5" : undefined} p={selected ? 5 : 3} borderRadius={selected ? 10 : "3px"}>

                {rows.map((item, index) => {
                    return <VStack key={item.id} w="100%" alignItems="flex-start">
                        <HStack w="100%" alignItems="flex-start">
                            {variant === "ordered" && <Box fontWeight={"bold"} mr={1} minW="25px">{index + 1}</Box>}

                            {variant === "unordered" && <Box fontWeight={"bold"} mr={1} minW="15px">&bull;</Box>}

                            <Box flex={1}>

                                <ContentEditableField triggerOnEmptyBlurOnBlur={true} value={item.text} enterNotAllowed={true} onEmptyBlur={() => {
                                    DeleteRow(item.id)
                                }} onEnterKey={(shift) => {
                                    if (!shift) AddRow(item.id)
                                }} focus={editorInteracted && item.id === selectedRowId} onChange={(value) => itemChange(item.id, value)} onEmptyDelete={() => DeleteRow(item.id)} ></ContentEditableField>

                            </Box>
                        </HStack>
                    </VStack>
                })}


            </Box>

        ) : <Box></Box>

    )
}
