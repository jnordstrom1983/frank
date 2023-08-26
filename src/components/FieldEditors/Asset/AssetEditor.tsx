"use client"
import { AssetInternalViewModel } from "@/app/api/space/[spaceid]/asset/get"
import { PostContentRequest } from "@/app/api/space/[spaceid]/content/post"
import Editor from "@/components/ContentEditor/Editor"
import { Empty } from "@/components/Empty"
import TextInput from "@/components/TextInput"
import { UploadButton } from "@/components/UploadButton"
import { Content, ContentInternalViewModel } from "@/models/content"
import { apiClient } from "@/networking/ApiClient"
import { useAssets } from "@/networking/hooks/asset"
import { useContent } from "@/networking/hooks/content"
import { useContentypes } from "@/networking/hooks/contenttypes"
import {
    Box,
    Button,
    Flex,
    HStack,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Spinner,
    VStack,
    useToast,
    Image,
} from "@chakra-ui/react"
import { DndContext, DragEndEvent, DraggableAttributes, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core"
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities"
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useQueryClient } from "@tanstack/react-query"

import { useEffect, useState } from "react"
import { AlignJustify, ChevronDown, X } from "react-feather"
import { ZodArray, ZodOptional, ZodString } from "zod"

export function AssetEditor({
    value,
    subject,
    description,
    onChange,
    validationSchema,
    showValidation,
    enableSelect,
    enableCreate,
    multiple,
    spaceId,
    onValidation,
    editable = true,
    imageWidth,
    imageHeight,
    type,
}: {
    value: string[]
    subject: string
    description: string
    onChange: (value: string[]) => void
    validationSchema: ZodString | ZodOptional<any> | ZodArray<any>
    onValidation?: (valid: boolean) => void
    showValidation: boolean
    enableSelect: boolean
    enableCreate: boolean
    multiple: boolean
    spaceId: string
    editable?: boolean,
    imageWidth?: number,
    imageHeight?: number,
    type: "file" | "image",
}) {
    const [internalErrors, setInternalErrors] = useState<string[]>([])
    const [internalValue, setInternalValue] = useState<string[]>([])
    const [showPickAsset, setShowPickAsset] = useState<boolean>(false)
    const { items: allItems, isLoading: isContentLoading } = useAssets(spaceId, {})
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const queryClient = useQueryClient()
    const toast = useToast()

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        if (!over) return
        if (active.id !== over.id) {
            setInternalValue((items) => {
                const oldIndex = items.findIndex((i) => i === active.id)
                const newIndex = items.findIndex((i) => i === over.id)

                const newItems = arrayMove(items, oldIndex, newIndex)
                onChange(newItems)
                return newItems
            })
        }
    }

    const sortableItems = internalValue.map((item) => ({
        id: item,
    }))

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    useEffect(() => {
        if (value) {
            if (Array.isArray(value)) {
                setInternalValue(value)
                validateData(value, true)
            } else {
                setInternalValue([value])
                validateData([value], true)
            }
        } else {
            setInternalValue([])
            validateData([], true)
        }
    }, [value])

    useEffect(() => {
        if (showValidation) {
            validateData(internalValue, false)
        } else {
            validateData(internalValue, true)
            setInternalErrors([])
        }
    }, [showValidation])

    useEffect(() => {
        if (!allItems) return
        setIsLoading(false)
    }, [allItems])

    function validateData(value: string[], silent?: boolean) {
        let validationData = multiple ? value : value.length > 0 ? value[0] : undefined
        const validationResult = validationSchema.safeParse(validationData)
        if (silent) {
            setInternalErrors([])
        } else {
            if (validationResult.success) {
                setInternalErrors([])
            } else {
                setInternalErrors(validationResult.error.errors.map((e: any) => e.message))
            }
        }
        onValidation && onValidation(validationResult.success)
        return validationResult.success
    }



    return (
        <>

            <VStack alignItems={"flex-start"} w="100%">
                {(subject || internalErrors.length > 0) && (
                    <HStack>
                        {subject && <Box>{subject}</Box>}
                        {internalErrors.map((e) => (
                            <Box key={e} bg="red.400" color="white" padding="3px" borderRadius="3px" fontSize="12px">
                                {e}
                            </Box>
                        ))}
                    </HStack>
                )}
                {description && (
                    <Box color="gray.400" fontStyle="italic">
                        {description}
                    </Box>
                )}

                {isLoading ? (
                    <Box>
                        <Spinner></Spinner>
                    </Box>
                ) : (
                    <VStack spacing={5} w="100%" alignItems={"flex-start"}>
                        {((enableSelect && (multiple || internalValue.length < 1)) || (enableCreate && (multiple || internalValue.length < 1))) && (

                            editable ? <HStack>
                                {enableSelect && (multiple || internalValue.length < 1) && (
                                    <Button w="150px" onClick={() => setShowPickAsset(true)}>
                                        {multiple ? "ADD" : "SELECT"} EXISTING
                                    </Button>
                                )}
                                {enableCreate && (multiple || internalValue.length < 1) && (
                                    //type={asset.type === "image" ? "image" : "file"}
                                    <UploadButton positiveImageButtonText="Upload" type={type} width={imageWidth} height={imageHeight} colorScheme="gray" text={`UPLOAD`} spaceId={spaceId} onUploaded={(asset) => {
                                        queryClient.invalidateQueries([["asset", spaceId]]);
                                        let newValue = [...internalValue]
                                        if (!multiple) {
                                            newValue = []
                                        }
                                        if (!newValue.includes(asset.assetId)) {
                                            newValue = [...newValue, asset.assetId]
                                        }
                                        setInternalValue(newValue)
                                        onChange(newValue)
                                        setShowPickAsset(false)
                                        validateData(newValue, false)


                                    }}></UploadButton>

                                )}
                            </HStack>
                                : <Box>No asset selected.
                                </Box>
                        )}

                        {showPickAsset && (
                            <PickAsset
                                type={type}
                                spaceId={spaceId}
                                onCancel={() => setShowPickAsset(false)}
                                onSelect={(assetId) => {
                                    let newValue = [...internalValue]
                                    if (!multiple) {
                                        newValue = []
                                    }
                                    if (!newValue.includes(assetId)) {
                                        newValue = [...newValue, assetId]
                                    }
                                    setInternalValue(newValue)
                                    onChange(newValue)
                                    setShowPickAsset(false)
                                    validateData(newValue, false)
                                }}
                            ></PickAsset>
                        )}

                        {internalValue.length > 0 && editable && <VStack spacing={3} w="100%">
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
                                    {internalValue.map((f) => (
                                        <SortableItem

                                            id={f}
                                            key={f}
                                            allItems={allItems}
                                            assetId={f}
                                            onRemove={(assetId) => {
                                                let newValue = [...internalValue].filter((i) => i !== assetId)
                                                setInternalValue(newValue)
                                                onChange(newValue)
                                                validateData(newValue, false)
                                            }}
                                            editable={editable}
                                            sortable={multiple && internalValue.length > 1}
                                        ></SortableItem>
                                    ))}
                                </SortableContext>
                            </DndContext>
                        </VStack>}
                        {internalValue.length > 0 && !editable && <VStack spacing={3} w="100%">
                            {internalValue.map((f) => (
                                <SortableItem
                                    id={f}
                                    key={f}
                                    allItems={allItems}
                                    assetId={f}
                                    onRemove={(assetId) => {
                                        let newValue = [...internalValue].filter((i) => i !== assetId)
                                        setInternalValue(newValue)
                                        onChange(newValue)
                                        validateData(newValue, false)
                                    }}
                                    sortable={multiple && internalValue.length > 1}
                                    editable={editable}
                                ></SortableItem>
                            ))}
                        </VStack>}

                    </VStack>
                )}
            </VStack>
        </>
    )
}

function SortableItem({
    id,
    assetId,
    allItems,
    onRemove,
    sortable,
    editable
}: {
    id: string
    allItems: AssetInternalViewModel[] | undefined
    assetId: string
    onRemove: (contentId: string) => void
    sortable: boolean,
    editable: boolean
}) {
    let item = allItems?.find((p) => p.assetId === assetId)

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return editable ? (
        <Box key={assetId} h="auto" backgroundColor="#F5F5F5" borderRadius="10px" w="100%" p={5} ref={setNodeRef} style={style}>
            <RenderItem sortable={sortable} editable={true} item={item} onRemove={() => onRemove(assetId)} listeners={listeners} attributes={attributes}></RenderItem>
        </Box>
    ) : <Box key={assetId} h="auto" borderRadius="10px" w="100%" p={5} ref={setNodeRef} style={style}>
        <RenderItem sortable={false} editable={false} item={item} onRemove={() => { }} listeners={listeners} attributes={attributes}></RenderItem>
    </Box>
}

function RenderItem({
    item,
    onRemove,
    attributes,
    listeners,
    sortable,
    editable
}: {
    item?: AssetInternalViewModel
    onRemove: () => void
    listeners: SyntheticListenerMap | undefined
    attributes: DraggableAttributes
    sortable: boolean,
    editable: boolean
}) {
    return (
        <HStack w="100%" alignItems={"center"} spacing={5}>
            {sortable && editable && (
                <Box {...attributes} {...listeners} cursor="grab">
                    <AlignJustify></AlignJustify>
                </Box>
            )}

            {
                item?.type === "image" && <Box w="100px" h="100px" backgroundColor="#fff" borderRadius="3px"><Image src={item.url} w="100px" h="100px" objectFit="contain"></Image></Box>
            }


            <VStack flex={1} alignItems={"flex-start"}>
                <Box>{item ? item.name : "-"}</Box>
                <Box fontSize="14px"> {item ? item.description : "-"}</Box>
            </VStack>
            {editable &&
                <Button
                    variant="ghost"
                    onClickCapture={() => {
                        onRemove()
                    }}
                >
                    <X></X>
                </Button>
            }
        </HStack>
    )
}
function PickAsset({ spaceId, onCancel, onSelect, type }: { spaceId: string; onCancel: () => void; onSelect: (contentId: string) => void, type: "file" | "image" }) {

    const { items: allItems, isLoading: isContentLoading } = useAssets(spaceId, {})
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [filteredItems, setFilteredItems] = useState<AssetInternalViewModel[]>([])
    const [filterText, setFilterText] = useState<string>("")
    useEffect(() => {
        if (!allItems) return
        setIsLoading(false)
        let filtered: AssetInternalViewModel[] = [...allItems]

        if (type === "image") {
            filtered = filtered.filter((item) => {
                return item.type === "image"
            })
        }
        if (filterText) {
            filtered = filtered.filter((item) => {
                const hasTitle = item.name.toLowerCase().includes(filterText.toLowerCase())
                return hasTitle
            })
        }
        setFilteredItems(filtered)
    }, [allItems, filterText])

    const [selectedAsset, setSelectedAsset] = useState<string>("")
    return (
        <Modal isOpen={true} onClose={onCancel} isCentered={true}>
            <ModalOverlay />
            <ModalContent maxW="600px" maxH="90%">
                <ModalHeader pt={10} px={10} pb={0}>
                    Select asset
                </ModalHeader>
                <ModalCloseButton right={10} top={10} />
                <ModalBody overflow="auto" p={10}>
                    {isLoading ? (
                        <Flex w="100%" alignItems={"center"}>
                            <Spinner></Spinner>
                        </Flex>
                    ) : (
                        <VStack w="100%" spacing={10}>
                            <TextInput value={filterText} focus={true} onChange={setFilterText} placeholder="Enter text to search for assets"></TextInput>
                            {filteredItems.length === 0 ? (
                                <Empty message="No asset found"></Empty>
                            ) : (
                                <VStack w="100%" alignItems={"flex-start"} spacing={3}>
                                    {filteredItems.map((item) => {
                                        return (
                                            <Button
                                                key={item.assetId}
                                                variant="ghost"
                                                backgroundColor={selectedAsset === item.assetId ? "blue.100" : "#F5F5F5"}
                                                h="auto"
                                                borderRadius="10px"
                                                w="100%"
                                                p={5}
                                                onClick={() => {
                                                    setSelectedAsset(item.assetId)
                                                }}
                                            >
                                                <HStack w="100%" spacing={5}>

                                                    {
                                                        item.type === "image" && <Box w="100px" h="100px" backgroundColor="#fff" borderRadius="3px"><Image src={item.url} w="100px" h="100px" objectFit="contain"></Image></Box>
                                                    }
                                                    <VStack flex={1} alignItems={"flex-start"} justifyContent="flex-start" whiteSpace="normal">
                                                        <Box>{item.name}</Box>
                                                        <Box fontSize="14px" textAlign="left">{item.description}</Box>
                                                    </VStack>
                                                </HStack>
                                            </Button>
                                        )
                                    })}
                                </VStack>
                            )}
                        </VStack>
                    )}
                </ModalBody>

                <ModalFooter pb={10} px={10} gap={10}>
                    <Button
                        colorScheme="blue"
                        isDisabled={!selectedAsset}
                        onClick={() => {
                            onSelect(selectedAsset)
                        }}
                    >
                        Select
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            onCancel()
                        }}
                    >
                        Cancel
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}


