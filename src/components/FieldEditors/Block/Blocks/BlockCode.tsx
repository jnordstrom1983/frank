"use client"
import { Box, HStack } from "@chakra-ui/react"

import { ContentEditableField } from "@/components/ContentEditableField"
import { Source_Code_Pro } from "next/font/google"

const sourceCodePro = Source_Code_Pro({ subsets: ["latin"] })

export function BlockCode({
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
        <HStack>
            <Box className={sourceCodePro.className} flex={1} backgroundColor={selected ? "#F5F5F5" : "#f5f5f5"} p={selected ? 5 : 3} borderRadius={selected ? 10 : "3px"}>
                <ContentEditableField value={data} enterNotAllowed={true} onEnterKey={(shift) => {
                    if (!shift) onAdd("paragraph")
                }} focus={editorInteracted && selected} onChange={onChange} onEmptyBlur={onDelete} onDeselect={onDeselect}></ContentEditableField>
            </Box>
        </HStack>
    )
}
