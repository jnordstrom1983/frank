"use client"
import { Box, Divider } from "@chakra-ui/react"
import React from "react"


export function BlockDivider({
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
    return (
        <Box p={5}>
            <Divider borderColor="gray.300" borderWidth="2px">

            </Divider>

        </Box>
    )
}
