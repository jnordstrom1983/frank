"use client"
import { Box } from "@chakra-ui/react"
import { useState } from "react"

import { ContentEditableField } from "@/components/ContentEditableField"

export function BlockHeading({
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

    let fontSize = "28px"
    if (variant === "medium") fontSize = "20px"
    if (variant === "small") fontSize = "16px"
    return (
        <Box backgroundColor={selected ? "#F5F5F5" : undefined} p={selected ? 5 : 3} borderRadius={selected ? 10 : 0} fontSize={fontSize} fontWeight={"bold"}>
            <ContentEditableField value={data} focus={editorInteracted && selected} onChange={onChange} onEmptyBlur={onDelete} onDeselect={onDeselect} enterNotAllowed={true} onEnterKey={(shift) => {
                if (!shift) onAdd("paragraph")
            }} ></ContentEditableField>
        </Box>
    )
}
