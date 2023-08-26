"use client"
import { Box, Flex, HStack } from "@chakra-ui/react"

import { ContentEditableField } from "@/components/ContentEditableField"
import { Source_Code_Pro } from "next/font/google"
import React, { useEffect, useState } from "react"
import { ReferencesEditor } from "../../Reference/ReferencesEditor"
import { z } from "zod"
import { Folder, Link } from "react-feather"
import { AssetEditor } from "../../Asset/AssetEditor"

export function BlockAsset({
    variant,
    data,
    onChange,
    selected,
    onDelete,
    onDeselect,
    editorInteracted,
    onAdd,
    spaceId
}: {
    selected: boolean
    variant: string
    data: string
    onChange: (data: any) => void
    onDelete: () => void
    onDeselect: () => void
    editorInteracted: boolean,
    onAdd: (blockTypeId: string) => void,
    spaceId: string
}) {

    const [initialData, setInitialData] = useState<string[]>([]);
    useEffect(() => {
        if (!data) return;
        if (Array.isArray(data)) {
            setInitialData(data)
        } else {
            setInitialData([data])
        }
    }, [data])

    function dataChanged(value: string[]) {
        if (value.length === 0) {
            onChange("")
        } else {
            onChange(value[0])
        }
    }
    return (

        <HStack w="100%" gap={5}>
            {!selected && <Box p={3} pr={0} color="gray.500">
                <Folder size="48px"></Folder>
            </Box>
            }
            <Box p={selected ? undefined : 3} flex={1} pl={0}>
                <AssetEditor
                    editable={selected}
                    spaceId={spaceId}
                    value={initialData}
                    multiple={false}

                    onChange={dataChanged}
                    validationSchema={z.string().optional()}
                    showValidation={false}
                    enableSelect={true}
                    enableCreate={true}
                    type="file" subject={""} description={""}             ></AssetEditor>

            </Box>
        </HStack>




    )
}
