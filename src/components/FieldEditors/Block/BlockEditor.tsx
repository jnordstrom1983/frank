"use client"
import { Box, VStack } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import shortUUID from "short-uuid"
import { z } from "zod"

import { blockTypes } from "@/lib/constants"
import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { RenderBlock } from "./RenderBlock"

export const BlockSchema = z.object({
    id: z.string(),
    type: z.string(),
    variant: z.string(),
    data: z.any(),
})
export type Block = z.infer<typeof BlockSchema>

export const BlockTypeSchema = z.object({
    id: z.string(),
    name: z.string(),
    defaultData: z.any(),
    defaultVariant: z.string(),
    variants: z.array(z.string()).min(1),
    convertsTo: z.array(z.string()),
})

export type BlockType = z.infer<typeof BlockTypeSchema>

export function BlockEditor({ blocks, onChange, spaceId, blockTypes: enabledBlockTypes }: { blocks: Block[]; onChange: (data: Block[]) => void, spaceId: string, blockTypes: string[] }) {
    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        if (!over) return
        if (active.id !== over.id) {
            setInternalBlocks((items) => {
                //Copy back updated values
                const blocks = [...items].map((b) => {
                    if (updatedValues[b.id] !== undefined) {
                        b.data = updatedValues[b.id]
                    }
                    return b
                })

                const oldIndex = items.findIndex((i) => i.id === active.id)
                const newIndex = items.findIndex((i) => i.id === over.id)

                const newItems = arrayMove(items, oldIndex, newIndex)

                onChange(newItems)
                return newItems
            })
        }
    }

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const [selectedBlockId, setSelectedBlockId] = useState<string>("")
    const [internalBlocks, setInternalBlocks] = useState<Block[]>([])
    const [updatedValues, setUpdatedValues] = useState<Record<string, any>>({})
    const [interacted, setInteracted] = useState<boolean>(false)
    useEffect(() => {
        if (blocks === undefined) {
            blocks = []
        }
        if (blocks.length === 0) {
            const block: Block = {
                id: shortUUID().generate(),
                type: "paragraph",
                variant: "normal",
                data: "",
            }
            setInternalBlocks([block])
            setSelectedBlockId(block.id)
            //onChange([block])

            return
        }
        if (blocks.length > 0) {
            setInternalBlocks(blocks)
            setSelectedBlockId(blocks[blocks.length - 1].id)
        }
    }, [blocks])

    function updatedValue(blockId: string, value: any) {
        setUpdatedValues((updatedValues) => {

            let newUpdated: Record<string, any> = { ...updatedValues }
            newUpdated[blockId] = JSON.parse(JSON.stringify(value))
            setUpdatedValues(newUpdated)

            const blocks = [...JSON.parse(JSON.stringify(internalBlocks))].map((b) => {
                if (newUpdated[b.id] !== undefined) {
                    b.data = newUpdated[b.id]
                }
                return b
            })
            setTimeout(() => {
                onChange(blocks)
            }, 1)
            return newUpdated
        })
    }

    function onAdd(afterBlockId: string, blockTypeId: string) {
        setUpdatedValues((updatedValues) => {


            setInternalBlocks((internalBlocks) => {
                const type = blockTypes.find((t) => t.id === blockTypeId)
                if (!type) return internalBlocks
                const block: Block = {
                    id: shortUUID().generate(),
                    type: blockTypeId,
                    variant: type.defaultVariant,
                    data: type.defaultData,
                }

                //Copy back updated values
                const blocks = [...internalBlocks].map((b) => {
                    if (updatedValues[b.id] !== undefined) {
                        b.data = updatedValues[b.id]
                    }
                    return b
                })

                const index = blocks.findIndex((p) => p.id === afterBlockId)
                let newBlocks = [...blocks.slice(0, index + 1), block, ...blocks.slice(index + 1)]
                if (blocks[index].data === "") {
                    newBlocks = newBlocks.filter(p => p.id !== blocks[index].id)
                }
                setSelectedBlockId(block.id)
                setTimeout(() => {
                    onChange(newBlocks)
                }, 1)
                return newBlocks

            })
            return updatedValues
        })


    }

    function onDelete(blockId: string) {
        const blocks = [...internalBlocks]
            .filter((b) => b.id !== blockId)
            .map((b) => {
                if (updatedValues[b.id] !== undefined) {
                    b.data = updatedValues[b.id]
                }
                return b
            })
        if (blocks.length === 0) {
            const block: Block = {
                id: shortUUID().generate(),
                type: "paragraph",
                variant: "normal",
                data: "",
            }
            onChange([block])
            setInternalBlocks([block])
            return
        }
        setInternalBlocks(blocks)
        onChange(blocks)
    }

    function onChangeVariant(blockId: string, variant: string) {
        const blocks = [...internalBlocks].map((b) => {
            if (updatedValues[b.id] !== undefined) {
                b.data = updatedValues[b.id]
            }
            if (b.id === blockId) {
                b.variant = variant
            }
            return b
        })
        setInternalBlocks(blocks)
        onChange(blocks)
    }
    function onConvert(blockId: string, toType: string) {
        const blocks = [...internalBlocks].map((b) => {
            if (updatedValues[b.id] !== undefined) {
                b.data = updatedValues[b.id]
            }
            if (b.id === blockId) {
                const toTypeObject = blockTypes.find((bt) => bt.id === toType)
                if (toTypeObject) {
                    b.variant = toTypeObject.defaultVariant
                }
                b.type = toType
            }
            return b
        })
        setInternalBlocks(blocks)
        onChange(blocks)
    }

    return (
        <Box borderWidth="1px" onMouseDown={() => setInteracted(true)} borderStyle={"solid"} borderColor="gray.100" backgroundColor={"#fff"} p={5} borderRadius="3px" minH="300px">
            <VStack>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={internalBlocks} strategy={verticalListSortingStrategy}>
                        {internalBlocks.map((block) => {
                            return (
                                <RenderBlock
                                    enabledBlockTypes={["paragraph", ...enabledBlockTypes]}
                                    editorInteracted={interacted}
                                    key={block.id}
                                    block={block}
                                    onChange={(value) => updatedValue(block.id, value)}
                                    selected={selectedBlockId === block.id}
                                    onSelect={() => setSelectedBlockId(block.id)}
                                    onAdd={(typeId) => onAdd(block.id, typeId)}
                                    onDelete={() => onDelete(block.id)}
                                    onDeselect={() => setSelectedBlockId("")}
                                    onChangeVariant={(variant) => onChangeVariant(block.id, variant)}
                                    onConvert={(toType) => onConvert(block.id, toType)}
                                    spaceId={spaceId}
                                ></RenderBlock>
                            )
                        })}
                    </SortableContext>
                </DndContext>
            </VStack>
        </Box>
    )
}
