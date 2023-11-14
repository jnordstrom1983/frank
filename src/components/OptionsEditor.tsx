import { FieldOption } from "@/models/field";
import { Box, Button, Flex, HStack, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { X } from "react-feather";
import { ZodString, z } from "zod";
import TextInput from "./TextInput";

import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableOption {
    id: string
}

export function OptionsEditor({ options, type, onChange, subject, placeHolder }: { options: FieldOption[], type: "string" | "number", onChange: (options: FieldOption[]) => void, subject?: string, placeHolder?: string }) {

    const [valid, setValid] = useState<boolean>(true)
    const [internalValue, setInternalValue] = useState<string>("");
    const [internalOptions, setInternalOptions] = useState<FieldOption[]>(options)
    useEffect(() => {
        setInternalOptions(options)
        setInternalValue("")
    }, [options])
    function onSubmit(value: string) {
        if (!valid) return
        if (!value) return;
        if (internalOptions.includes(value)) return;
        let newOptions = [...internalOptions, value];
        if (type === "number") {
            newOptions = [...internalOptions, parseInt(value)];
        }


        setInternalOptions(newOptions);
        setInternalValue("")
        onChange(newOptions)
    }
    function removeOption(option: FieldOption) {
        
        const newOptions = [...internalOptions].filter(o => o !== option)
        setInternalOptions(newOptions);
        onChange(newOptions)
    }

    let validator: ZodString = z.string().max(64)
    if (type == "number") {
        validator = z.string().regex(/^\d+$/)
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        if (!over) return
        if (active.id !== over.id) {
            setInternalOptions((items) => {
                const oldIndex = items.findIndex((i) => i === active.id)
                const newIndex = items.findIndex((i) => i === over.id)

                const newItems = arrayMove(items, oldIndex, newIndex)
                onChange(newItems)
                return newItems
            })
        }
    }

    const sortableItems = internalOptions.map((item) => ({
        id: item,
    }))

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )



    return <VStack w="100%" alignItems={"flex-start"}>
        <TextInput value={internalValue} subject={subject} placeholder={placeHolder || "Enter value and press enter to add to list of accepted values"} onChange={setInternalValue} onSubmit={onSubmit} validate={validator} onValidation={setValid}></TextInput>
        <Flex flexWrap={"wrap"} gap={5} >


            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={sortableItems} strategy={rectSortingStrategy}>
                    {sortableItems.map(o => <SortableItem key={o.id} onRemove={() => removeOption(o.id)} value={o.id}></SortableItem>)}

                </SortableContext>
            </DndContext>




        </Flex>
    </VStack>


}

function SortableItem({ value, onRemove }: { value: string | number, onRemove: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: value })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }



    return <Box bg="gray.100" p={1} fontSize="12px" key={value} ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <HStack spacing={1} w="100%">
            <Box pl={3}>{value}</Box>
            <Button variant={"ghost"} onClickCapture={() => {
                onRemove()
            }}>
                <X size="16px"></X>
            </Button>
        </HStack>
    </Box>
}