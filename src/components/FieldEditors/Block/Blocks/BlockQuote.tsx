"use client"
import { Box, HStack } from "@chakra-ui/react"

import { ContentEditableField } from "@/components/ContentEditableField"

export function BlockQuote({
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
    editorInteracted: boolean
    onAdd: (blockTypeId: string) => void
}) {
    return (
        <HStack position={"relative"}>
            <Box marginLeft={5} width={5}>
                <Box position={"absolute"} left={5} top={6} lineHeight="10px" fontSize="48px" color={"gray.400"} fontWeight={"bold"}>
                    &ldquo;
                </Box>
            </Box>
            <Box flex={1} backgroundColor={selected ? "#F5F5F5" : undefined} fontStyle={selected ? undefined : "italic"} p={selected ? 5 : 3} borderRadius={selected ? 10 : 0}>
                <ContentEditableField value={data} focus={editorInteracted && selected} onChange={onChange} onEmptyBlur={onDelete} onDeselect={onDeselect} enterNotAllowed={true} onEnterKey={(shift) => {
                    if (!shift) onAdd("paragraph")
                }} ></ContentEditableField>
            </Box>
            <Box marginRight={5} width={5}>
                <Box position={"absolute"} right={5} bottom={1} lineHeight="10px" fontSize="48px" color={"gray.400"} fontWeight={"bold"}>
                    &rdquo;
                </Box>
            </Box>
        </HStack>
    )
}
