"use client"
import { Box, Button, HStack, Menu, MenuButton, MenuDivider, MenuGroup, MenuItem, MenuList } from "@chakra-ui/react"
import { AlignJustify, CheckCircle, Circle, PlusCircle, Repeat, Sliders, Trash } from "react-feather"

import { blockTypes } from "@/lib/constants"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Block } from "./BlockEditor"
import { BlockCode } from "./Blocks/BlockCode"
import { BlockHeading } from "./Blocks/BlockHeading"
import { BlockParagraph } from "./Blocks/BlockParagraph"
import { BlockQuote } from "./Blocks/BlockQuote"
import { BlockList } from "./Blocks/BlockList"
import { BlockReference } from "./Blocks/BlockReference"
import { BlockTable } from "./Blocks/BlockTable"
import { BlockDivider } from "./Blocks/BlockDivider"
import { BlockAsset } from "./Blocks/BlockAsset"

export function RenderBlock({
    block,
    selected,
    onChange,
    onSelect,
    onAdd,
    onDelete,
    onDeselect,
    onChangeVariant,
    onConvert,
    editorInteracted,
    spaceId,
    enabledBlockTypes
}: {
    block: Block
    selected: boolean
    onChange: (data: any) => void
    onSelect: () => void
    onAdd: (typeId: string) => void
    onDelete: () => void
    onDeselect: () => void
    onChangeVariant: (variant: string) => void
    onConvert: (toType: string) => void
    editorInteracted: boolean,
    spaceId: string,
    enabledBlockTypes: string[]
}) {
    const type = blockTypes.find((p) => p.id === block.type)

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id })
    if (transform) {
        transform.scaleY = 1
    }
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <Box
            ref={setNodeRef}
            style={style}
            borderWidth="1px"
            borderStyle={selected ? "solid" : "dashed"}
            borderRadius="3px"
            borderColor={selected ? "transparent" : "gray.100"}
            w="100%"
            onMouseDown={() => {
                !selected && onSelect()
            }}
        >
            <HStack alignItems={"center"}>
                {selected && (
                    <Menu placement="auto-end">
                        {({ isOpen }) => (
                            <>
                                <MenuButton isActive={isOpen} as={Button} variant={"ghost"}>
                                    <PlusCircle></PlusCircle>
                                </MenuButton>

                                <MenuList>
                                    <MenuGroup title="Add block">
                                        {blockTypes.filter(item => enabledBlockTypes.includes(item.id)).map((item) => (
                                            <MenuItem
                                                key={item.id}
                                                onClick={async () => {
                                                    onAdd(item.id)
                                                }}
                                            >
                                                {item.name}
                                            </MenuItem>
                                        ))}
                                    </MenuGroup>
                                </MenuList>
                            </>
                        )}
                    </Menu>
                )}
                <Box flex="1">
                    {block.type === "paragraph" && (
                        <BlockParagraph
                            variant={block.variant}
                            data={block.data}
                            selected={selected}
                            onChange={onChange}
                            onDelete={onDelete}
                            onDeselect={onDeselect}
                            editorInteracted={editorInteracted}
                            onAdd={onAdd}
                        ></BlockParagraph>
                    )}
                    {block.type === "heading" && (
                        <BlockHeading
                            variant={block.variant}
                            editorInteracted={editorInteracted}
                            data={block.data}
                            selected={selected}
                            onChange={onChange}
                            onDelete={onDelete}
                            onDeselect={onDeselect}
                            onAdd={onAdd}
                        ></BlockHeading>
                    )}
                    {block.type === "quote" && (
                        <BlockQuote
                            variant={block.variant}
                            editorInteracted={editorInteracted}
                            data={block.data}
                            selected={selected}
                            onChange={onChange}
                            onDelete={onDelete}
                            onDeselect={onDeselect}
                            onAdd={onAdd}
                        ></BlockQuote>
                    )}
                    {block.type === "code" && (
                        <BlockCode
                            variant={block.variant}
                            editorInteracted={editorInteracted}
                            data={block.data}
                            selected={selected}
                            onChange={onChange}
                            onDelete={onDelete}
                            onDeselect={onDeselect}
                            onAdd={onAdd}
                        ></BlockCode>
                    )}
                    {block.type === "list" && (
                        <BlockList
                            variant={block.variant}
                            editorInteracted={editorInteracted}
                            data={block.data}
                            selected={selected}
                            onChange={onChange}
                            onDelete={onDelete}
                            onDeselect={onDeselect}
                            onAdd={onAdd}
                        ></BlockList>
                    )}
                    {block.type === "reference" && (
                        <BlockReference
                            variant={block.variant}
                            editorInteracted={editorInteracted}
                            data={block.data}
                            selected={selected}
                            onChange={onChange}
                            onDelete={onDelete}
                            onDeselect={onDeselect}
                            onAdd={onAdd}
                            spaceId={spaceId}
                        ></BlockReference>
                    )}
                    {block.type === "table" && (
                        <BlockTable
                            variant={block.variant}
                            editorInteracted={editorInteracted}
                            data={block.data}
                            selected={selected}
                            onChange={onChange}
                            onDelete={onDelete}
                            onDeselect={onDeselect}
                            onAdd={onAdd}
                        ></BlockTable>
                    )}
                    {block.type === "divider" && (
                        <BlockDivider
                            variant={block.variant}
                            editorInteracted={editorInteracted}
                            data={block.data}
                            selected={selected}
                            onChange={onChange}
                            onDelete={onDelete}
                            onDeselect={onDeselect}
                            onAdd={onAdd}
                        ></BlockDivider>
                    )}
                    {block.type === "asset" && (
                        <BlockAsset
                            variant={block.variant}
                            editorInteracted={editorInteracted}
                            data={block.data}
                            selected={selected}
                            onChange={onChange}
                            onDelete={onDelete}
                            onDeselect={onDeselect}
                            onAdd={onAdd} spaceId={spaceId}
                        ></BlockAsset>
                    )}
                </Box>
                {selected && (
                    <Menu placement="auto-start">
                        {({ isOpen }) => (
                            <>
                                <MenuButton isActive={isOpen} as={Button} variant={"ghost"}>
                                    <Sliders></Sliders>
                                </MenuButton>
                                <MenuList>
                                    {type!.variants.length > 1 && (
                                        <MenuGroup title="Variant">
                                            {type!.variants.map((item) => (
                                                <MenuItem
                                                    fontWeight={block.variant === item ? "bold" : undefined}
                                                    key={item}
                                                    onClick={async () => {
                                                        onChangeVariant(item)
                                                    }}
                                                    gap={3}
                                                >
                                                    {block.variant === item ? <CheckCircle></CheckCircle> : <Circle></Circle>}
                                                    {item}
                                                </MenuItem>
                                            ))}
                                            <MenuDivider></MenuDivider>
                                        </MenuGroup>
                                    )}

                                    {type!.convertsTo.filter(c => enabledBlockTypes.includes(c)).length > 0 && (
                                        <MenuGroup title="Convert">
                                            {type!.convertsTo.filter(c => enabledBlockTypes.includes(c)).map((item) => {
                                                const type = blockTypes.find((b) => b.id === item)
                                                return (
                                                    <MenuItem
                                                        key={item}
                                                        onClick={async () => {
                                                            onConvert(item)
                                                        }}
                                                        title={`Convert to ${type?.name || item}`}
                                                        gap={3}
                                                    >
                                                        <Repeat></Repeat>
                                                        {type?.name || item}
                                                    </MenuItem>
                                                )
                                            })}
                                            <MenuDivider></MenuDivider>
                                        </MenuGroup>
                                    )}
                                    <MenuItem
                                        key={"delete"}
                                        onClick={async () => {
                                            onDelete()
                                        }}
                                        title={`Delete block`}
                                        gap={3}
                                        color="red.500"
                                    >
                                        <Trash></Trash>Delete block
                                    </MenuItem>
                                </MenuList>
                            </>
                        )}
                    </Menu>
                )}

                {selected && (
                    <Box {...attributes} {...listeners} cursor="grab">
                        <AlignJustify></AlignJustify>
                    </Box>
                )}
            </HStack>
        </Box>
    )
}
