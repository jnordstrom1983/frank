"use client"
import { PostContentRequest } from "@/app/api/space/[spaceid]/content/post"
import Editor from "@/components/ContentEditor/Editor"
import { Empty } from "@/components/Empty"
import TextInput from "@/components/TextInput"
import { usePhrases } from "@/lib/lang"
import { Content, ContentInternalViewModel } from "@/models/content"
import { apiClient } from "@/networking/ApiClient"
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
} from "@chakra-ui/react"
import { DndContext, DragEndEvent, DraggableAttributes, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core"
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities"
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useQueryClient } from "@tanstack/react-query"
import { Console } from "console"
import { useEffect, useState } from "react"
import { AlignJustify, ChevronDown, X } from "react-feather"
import { ZodArray, ZodOptional, ZodString } from "zod"

export function ReferencesEditor({
    value,
    subject,
    description,
    onChange,
    validationSchema,
    showValidation,
    enableContentEditing,
    enableSelect,
    enableCreate,
    contentTypes,
    multiple,
    spaceId,
    onValidation,
    editable = true
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
    enableContentEditing: boolean
    contentTypes: string[]
    multiple: boolean
    spaceId: string
    editable?: boolean
}) {
    const [internalErrors, setInternalErrors] = useState<string[]>([])
    const [internalValue, setInternalValue] = useState<string[]>([])
    const [showPickContent, setShowPickContent] = useState<boolean>(false)
    const { items: allItems, isLoading: isContentLoading } = useContent(spaceId, {})
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [editContentId, setEditContentId] = useState<string>("")
    const { contenttypes: allContenttypes } = useContentypes(spaceId, {})
    const [createLoading, setCreateLoading] = useState<boolean>(false)
    const queryClient = useQueryClient()
    const toast = useToast()
    const { t }  = usePhrases();

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
        if (!allContenttypes) return
        setIsLoading(false)
    }, [allItems, allContenttypes])

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

    async function create(contentTypeId: string) {
        setCreateLoading(true)
        try {
            const content = await apiClient.post<Content, PostContentRequest>({
                path: `/space/${spaceId}/content`,
                isAuthRequired: true,
                body: {
                    contentTypeId: contentTypeId,
                },
            })
            setCreateLoading(false)

            setEditContentId(content.contentId)
            queryClient.invalidateQueries([["content", spaceId]])

            let newValue = [...internalValue]
            if (!multiple) {
                newValue = []
            }
            if (!newValue.includes(content.contentId)) {
                newValue = [...newValue, content.contentId]
            }
            setInternalValue(newValue)
            onChange(newValue)
        } catch (ex) {
            setCreateLoading(false)
            toast({
                title: t("asseteditor_could_not_create_title"),
                description: t("asseteditor_could_not_create_description"),
                status: "error",
                position: "bottom-right",
            })
        }
    }

    return (
        <>
            {editContentId && (
                <ContentEditorPopup contentId={editContentId} spaceId={spaceId} onCancel={() => setEditContentId("")} onSaved={() => setEditContentId("")}></ContentEditorPopup>
            )}

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
                                    <Button minW="150px" onClick={() => setShowPickContent(true)}>
                                        {multiple ? t("asseteditor_add_existing"): t("asseteditor_select_existing")} 
                                    </Button>
                                )}
                                {enableCreate && (multiple || internalValue.length < 1) && (
                                    <Menu>
                                        {allContenttypes!.filter((item) => contentTypes.includes("__all__") || contentTypes.includes(item.contentTypeId)).length === 1 ? (
                                            <Button
                                                width="150px"
                                                isLoading={createLoading}
                                                isDisabled={createLoading}
                                                onClick={() => {
                                                        create(allContenttypes!.filter((item) => contentTypes.includes("__all__") || contentTypes.includes(item.contentTypeId))[0].contentTypeId)
                                                }}
                                            >
                                                {t("asseteditor_create")}
                                            </Button>
                                        ) : (
                                            ({ isOpen }) => (
                                                <>
                                                    <MenuButton isActive={isOpen} as={Button} width="150px" isLoading={createLoading} isDisabled={createLoading}>
                                                        <HStack w="100%" justifyContent={"center"}>
                                                            <Box>{t("asseteditor_create")}</Box>
                                                            <ChevronDown></ChevronDown>
                                                        </HStack>
                                                    </MenuButton>
                                                    <MenuList>
                                                        {allContenttypes!
                                                            .filter((item) => contentTypes.includes("__all__") || contentTypes.includes(item.contentTypeId))
                                                            .map((item) => (
                                                                <MenuItem
                                                                    key={item.contentTypeId}
                                                                    onClick={async () => {
                                                                        create(item.contentTypeId)
                                                                    }}
                                                                >
                                                                    {item.name}
                                                                </MenuItem>
                                                            ))}
                                                    </MenuList>
                                                </>
                                            )
                                        )}
                                    </Menu>
                                )}
                            </HStack>
                                : <Box>{t("asseteditor_no_related_selected")}
                                </Box>
                        )}

                        {showPickContent && (
                            <PickContent
                                spaceId={spaceId}
                                contentTypes={contentTypes}
                                onCancel={() => setShowPickContent(false)}
                                onSelect={(contentId) => {
                                    let newValue = [...internalValue]
                                    if (!multiple) {
                                        newValue = []
                                    }
                                    if (!newValue.includes(contentId)) {
                                        newValue = [...newValue, contentId]
                                    }
                                    setInternalValue(newValue)
                                    onChange(newValue)
                                    setShowPickContent(false)
                                    validateData(newValue, false)
                                }}
                            ></PickContent>
                        )}

                        {internalValue.length > 0 && editable && <VStack spacing={3} w="100%">
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
                                    {internalValue.map((f) => (
                                        <SortableItem

                                            id={f}
                                            key={f}
                                            allItems={allItems}
                                            contentId={f}
                                            enableContentEditing={enableContentEditing}
                                            setEditContentId={setEditContentId}
                                            onRemove={(contentId) => {
                                                let newValue = [...internalValue].filter((i) => i !== contentId)
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
                                    contentId={f}
                                    enableContentEditing={enableContentEditing}
                                    setEditContentId={setEditContentId}
                                    onRemove={(contentId) => {
                                        let newValue = [...internalValue].filter((i) => i !== contentId)
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
    contentId,
    allItems,
    enableContentEditing,
    setEditContentId,
    onRemove,
    sortable,
    editable
}: {
    id: string
    allItems: ContentInternalViewModel[] | undefined
    contentId: string
    enableContentEditing: boolean
    setEditContentId: (value: string) => void
    onRemove: (contentId: string) => void
    sortable: boolean,
    editable: boolean
}) {
    let item = allItems?.find((p) => p.contentId === contentId)

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return editable ? enableContentEditing ? (
        <Box
            ref={setNodeRef}
            style={style}
            key={contentId}
            h="auto"
            backgroundColor="#F5F5F5"
            borderRadius="10px"
            w="100%"
            p={5}
            _hover={{
                backgroundColor: "gray.200",
                cursor: "pointer",
            }}
            onClick={() => {
                setEditContentId(contentId)
            }}
        >
            <RenderItem sortable={sortable} editable={true} item={item} onRemove={() => onRemove(contentId)} listeners={listeners} attributes={attributes}></RenderItem>
        </Box>
    ) : (
        <Box key={contentId} h="auto" backgroundColor="#F5F5F5" borderRadius="10px" w="100%" p={5} ref={setNodeRef} style={style}>
            <RenderItem sortable={sortable} editable={true} item={item} onRemove={() => onRemove(contentId)} listeners={listeners} attributes={attributes}></RenderItem>
        </Box>
    ) : <Box key={contentId} h="auto" borderRadius="10px" w="100%" p={5} ref={setNodeRef} style={style}>
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
    item?: ContentInternalViewModel
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

            <VStack flex={1} alignItems={"flex-start"}>
                <Box>{item ? item.title : "-"}</Box>
                <Box fontSize="14px">{item ? item.contentTypeName : "-"}</Box>
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
function PickContent({ spaceId, contentTypes, onCancel, onSelect }: { spaceId: string; contentTypes: string[]; onCancel: () => void; onSelect: (contentId: string) => void }) {
    const { contenttypes, isLoading: isContentypesLoading } = useContentypes(spaceId, {})
    const { items: allItems, isLoading: isContentLoading } = useContent(spaceId, {})
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [filteredItems, setFilteredItems] = useState<ContentInternalViewModel[]>([])
    const [filterText, setFilterText] = useState<string>("")
    const { t } = usePhrases();

    useEffect(() => {
        if (!contenttypes) return
        if (!allItems) return
        setIsLoading(false)
        let filtered: ContentInternalViewModel[] = []

        if (contentTypes.includes("__all__")) {
            filtered = [...allItems]
        } else {
            filtered = allItems.filter((item) => contentTypes.includes(item.contentTypeId))
        }
        if (filterText) {
            filtered = filtered.filter((item) => {
                const hasTitle = item.title.toLowerCase().includes(filterText.toLowerCase())
                return hasTitle
            })
        }
        setFilteredItems(filtered)
    }, [contenttypes, allItems, filterText])

    const [selectedContent, setSelectedContent] = useState<string>("")
    return (
        <Modal isOpen={true} onClose={onCancel} isCentered={true}>
            <ModalOverlay />
            <ModalContent maxW="600px" maxH="90%">
                <ModalHeader pt={10} px={10} pb={0}>
                    {t("asseteditor_pick_heading")}
                </ModalHeader>
                <ModalCloseButton right={10} top={10} />
                <ModalBody overflow="auto" p={10}>
                    {isLoading ? (
                        <Flex w="100%" alignItems={"center"}>
                            <Spinner></Spinner>
                        </Flex>
                    ) : (
                        <VStack w="100%" spacing={10}>
                            <TextInput value={filterText} onChange={setFilterText} placeholder={t("asseteditor_pick_search_placeholder")}></TextInput>
                            {filteredItems.length === 0 ? (
                                <Empty message={t("asseteditor_pick_no_content_found")}></Empty>
                            ) : (
                                <VStack w="100%" alignItems={"flex-start"} spacing={3}>
                                    {filteredItems.map((item) => {
                                        return (
                                            <Button
                                                key={item.contentId}
                                                variant="ghost"
                                                backgroundColor={selectedContent === item.contentId ? "blue.100" : "#F5F5F5"}
                                                h="auto"
                                                borderRadius="10px"
                                                w="100%"
                                                p={5}
                                                onClick={() => {
                                                    setSelectedContent(item.contentId)
                                                }}
                                            >
                                                <HStack w="100%" alignItems={"flex-start"}>
                                                    <VStack flex={1} alignItems={"flex-start"}>
                                                        <Box>{item.title}</Box>
                                                        <Box fontSize="14px">{item.contentTypeName}</Box>
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
                        isDisabled={!selectedContent}
                        onClick={() => {
                            onSelect(selectedContent)
                        }}
                    >
                        {t("asseteditor_pick_button")}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            onCancel()
                        }}
                    >
                        {t("cancel")}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

function ContentEditorPopup({ spaceId, contentId, onCancel, onSaved }: { spaceId: string; contentId: string; onCancel: () => void; onSaved: () => void }) {
    const [title, setTitle] = useState<string>("")
    const { t } = usePhrases();
    return (
        <Modal isOpen={true} onClose={onCancel} isCentered={true}>
            <ModalOverlay />
            <ModalContent maxW="1100px" w="90%" maxH="90%" minH="80%">
                <ModalHeader pt={10} px={10} pb={0} fontWeight={"normal"}>
                    {t("asseteditor_editor_heading")}{" "}
                    <Box as="span" fontWeight={"bold"}>
                        {title}
                    </Box>
                </ModalHeader>
                <ModalCloseButton right={10} top={10} />
                <ModalBody overflow="auto" p={10}>
                    <Editor
                        spaceId={spaceId}
                        contentId={contentId}
                        tools={{
                            published: true,
                            language: true,
                            ai: true,
                            history: false,
                            folder: false,
                            delete: false,
                            save: true,
                            slug : true,
                            preview : true,
                        }}
                        showSaveBar={false}
                        onTitleChange={setTitle}
                        layout="row"
                        onBack={onCancel}
                        onSaved={onSaved}
                    ></Editor>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}
