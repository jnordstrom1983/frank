"use client"
import { Box, Button, HStack, Menu, MenuButton, MenuItem, MenuList, Table, Tbody, Td, Tr } from "@chakra-ui/react"

import { ContentEditableField } from "@/components/ContentEditableField"
import { Source_Code_Pro } from "next/font/google"
import React, { useEffect, useRef, useState } from "react"
import { Minus, MinusCircle, Plus, PlusCircle } from "react-feather"
import TextInput from "@/components/TextInput"
import { TableEditor } from "@/components/TableEditor"

const sourceCodePro = Source_Code_Pro({ subsets: ["latin"] })

export function BlockTable({
    variant,
    data,
    onChange,
    selected,
    onDelete,
    onDeselect,
    editorInteracted,
    onAdd,
}: {
    selected: boolean
    variant: string
    data: string[][]
    onChange: (data: any) => void
    onDelete: () => void
    onDeselect: () => void
    editorInteracted: boolean,
    onAdd: (blockTypeId: string) => void,
}) {

    return <TableEditor data={data} onChange={onChange} width={440} editable={selected}></TableEditor>
}
