"use client"
import { Box } from "@chakra-ui/react"
import { useState } from "react"

import { ContentEditableField } from "@/components/ContentEditableField"

export function BlockParagraph({
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
    const [internalData, setInternalData] = useState<string>(data)

    return (
        <Box
            backgroundColor={selected ? "#F5F5F5" : undefined}
            fontWeight={variant === "bold" ? "bold" : undefined}
            fontStyle={variant === "italic" ? "italic" : undefined}
            textDecoration={variant === "underline" ? "underline" : undefined}
            p={selected ? 5 : 3}
            borderRadius={selected ? 10 : 0}
        >
            <ContentEditableField value={data} onChange={onChange} focus={editorInteracted && selected} onEmptyBlur={onDelete} onDeselect={onDeselect} enterNotAllowed={true} onEnterKey={(shift) => {
                if (!shift) onAdd("paragraph")
            }} ></ContentEditableField>
        </Box>
    )
}
