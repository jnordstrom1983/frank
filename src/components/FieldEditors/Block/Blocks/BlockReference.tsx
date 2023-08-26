"use client"
import { Box, Flex, HStack } from "@chakra-ui/react"

import { ContentEditableField } from "@/components/ContentEditableField"
import { Source_Code_Pro } from "next/font/google"
import React, { useEffect, useState } from "react"
import { ReferencesEditor } from "../../Reference/ReferencesEditor"
import { z } from "zod"
import { Link } from "react-feather"

export function BlockReference({
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
        // <HStack>
        //     <Box className={sourceCodePro.className} flex={1} backgroundColor={selected ? "#F5F5F5" : "#f5f5f5"} p={selected ? 5 : 3} borderRadius={selected ? 10 : "3px"}>
        //         <ContentEditableField value={data} enterNotAllowed={true} onEnterKey={(shift) => {
        //             if (!shift) onAdd("paragraph")
        //         }} focus={editorInteracted && selected} onChange={onChange} onEmptyBlur={onDelete} onDeselect={onDeselect}></ContentEditableField>
        //     </Box>
        // </HStack>
        <HStack w="100%" gap={5}>
            {!selected && <Box p={3} pr={0} color="gray.500">
                <Link size="48px"></Link>
            </Box>
            }
            <Box p={selected ? undefined : 3} flex={1} pl={0}>
                <ReferencesEditor
                    editable={selected}
                    spaceId={spaceId}
                    value={initialData}
                    multiple={false}

                    onChange={dataChanged}
                    validationSchema={z.string().optional()}
                    showValidation={false}
                    enableSelect={true}
                    enableCreate={true}
                    enableContentEditing={true}
                    contentTypes={["__all__"]} subject={""} description={""}    ></ReferencesEditor>

            </Box>
        </HStack>




    )
}
