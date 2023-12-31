"use client"
import { PutContentTypeItemRequest, PutContentTypeItemResponse } from "@/app/api/space/[spaceid]/contenttype/[contenttypeid]/put"
import { Empty } from "@/components/Empty"
import { SaveMenuBar } from "@/components/SaveMenuBar"
import { SimpleCheckboxInput } from "@/components/SimpleCheckbox"
import TextInput from "@/components/TextInput"
import { Field } from "@/models/field"
import { apiClient } from "@/networking/ApiClient"
import { useContenttype } from "@/networking/hooks/contenttypes"
import { useAppStore } from "@/stores/appStore"
import {
    Box,
    Button,
    Center,
    Container,
    Flex,
    Grid,
    GridItem,
    HStack,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Spinner,
    Table,
    Tag,
    Tbody,
    Td,
    Th,
    Thead,
    Tooltip,
    Tr,
    VStack,
    useDisclosure,
    useToast,
} from "@chakra-ui/react"
import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { CodeBlock, monokai } from "react-code-blocks"
import { AlignJustify, Copy, Sliders, Trash } from "react-feather"
import { ConfigureField } from "./components/ConfigureField"
import { CreateField } from "./components/CreateField"

import { CheckboxInput } from "@/components/CheckboxInput"
import { dataTypes } from "@/lib/constants"
import { usePhrases } from "@/lib/lang"
import CopyToClipboard from "react-copy-to-clipboard"

interface SortableFields extends Field {
    id: string
}
export default function Home({ params }: { params: { spaceid: string; contenttypeid: string } }) {
    const { t } = usePhrases();
    const { showMainMenu, hideMainMenu } = useAppStore((state) => state)
    const { contenttype, isLoading } = useContenttype(params.spaceid, params.contenttypeid, {})
    const router = useRouter()
    const [name, setName] = useState<string>("")
    const [enabled, setEnabled] = useState<boolean>(false)
    const [generateSlug, setGenerateSlug] = useState<boolean>(false)
    const [hidden, setHidden] = useState<boolean>(false)
    const [externalPreview, setExternalPreview] = useState<string>("");

    const [showExternalPreview, setShowExternalPreview] = useState<boolean>(false)
    const toast = useToast()
    const [isSaveLoading, setIsSaveLoading] = useState<boolean>(false)
    const queryClient = useQueryClient()
    const [fields, setFields] = useState<Field[]>([])

    const [configureField, setConfigureField] = useState<Field>()
    useEffect(() => {
        hideMainMenu()
        return () => {
            showMainMenu()
        }
    }, [])
    useEffect(() => {
        if (!contenttype) return
        setName(contenttype.name)
        setEnabled(contenttype.enabled)
        setFields(contenttype.fields)
        setGenerateSlug(contenttype.generateSlug)
        setHidden(contenttype.hidden)
        setExternalPreview(contenttype.externalPreview || "")
        setShowExternalPreview(!!contenttype.externalPreview)
    }, [contenttype])

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const save = useCallback(async () => {
        setIsSaveLoading(true)
        try {
            let body: PutContentTypeItemRequest = {
                name,
                enabled,
                fields,
                generateSlug,
                hidden,
            }
            if (showExternalPreview) {
                body = { ...body, externalPreview }
            }
            await apiClient.put<PutContentTypeItemResponse, PutContentTypeItemRequest>({
                path: `/space/${params.spaceid}/contenttype/${params.contenttypeid}`,
                body,
                isAuthRequired: true,
            })
            toast({
                title: t("content_type_configure_save_success", name),
                status: "success",
                position: "bottom-right",
            })
            setIsSaveLoading(false)
            queryClient.removeQueries([["contenttype", params.spaceid, params.contenttypeid]])
            queryClient.removeQueries([["contenttypes", params.spaceid]])
            queryClient.invalidateQueries([["content", params.spaceid]])
            router.push(`/portal/spaces/${params.spaceid}/contenttype`)
        } catch (ex) {
            setIsSaveLoading(false)
            toast({
                title: t("content_type_configure_save_error_title"),
                description: t("content_type_configure_save_error_description"),
                status: "error",
                position: "bottom-right",
            })
        }
    }, [enabled, name, fields, generateSlug, hidden, externalPreview])

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        if (!over) return
        if (active.id !== over.id) {
            setFields((items) => {
                const oldIndex = items.findIndex((i) => i.fieldId === active.id)
                const newIndex = items.findIndex((i) => i.fieldId === over.id)

                return arrayMove(items, oldIndex, newIndex)
            })
        }
    }

    const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure()
    const { isOpen: isConfigureOpen, onOpen: onConfigureOpen, onClose: onConfigureClose } = useDisclosure()
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
    const { isOpen: isInterfaceOpen, onOpen: onInterfaceOpen, onClose: onInterfaceClose } = useDisclosure()

    const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false)

    const sortableFields = fields.map((item) => ({
        id: item.fieldId,
        ...item,
    }))

    function getContentTypeSchema() {
        if (!contenttype) return ""
        let schema = fields
            .map((f) => {
                const type = dataTypes.find((t) => t.id === f.dataTypeId)
                if (type) {
                    return `   ${f.fieldId}${f.validators.required?.enabled ? "" : "?"} : ${type.getDataTypeString(f)}`
                }
                return ""
            })
            .join("\n")

        return `interface ${contenttype.contentTypeId}Data{
${schema}
}

interface ${contenttype.contentTypeId}{
   contentTypeId: "${contenttype.contentTypeId}"
   contentId: string
   folderId?: string
   languageId: string
   modifiedDate: Date
   publishDate? : Date
   slug? : string
   data: ${contenttype.contentTypeId}Data
}`
    }


    const dataSchema = getContentTypeSchema()

    return (
        <>
            {isLoading ? (
                <Center h="100vh" w="100%">
                    <Spinner size="xl" colorScheme="blue"></Spinner>
                </Center>
            ) : (
                contenttype && (
                    <>
                        <CreateField
                            isOpen={isCreateOpen}
                            onClose={onCreateClose}
                            fields={fields}
                            onFieldAdded={(field: Field) => {
                                setFields([...fields, field])
                                setConfigureField({ ...field })
                                onConfigureOpen()
                            }}
                        ></CreateField>

                        {configureField && isConfigureOpen && (
                            <ConfigureField
                                isOpen={isConfigureOpen}
                                spaceId={params.spaceid}
                                onClose={onConfigureClose}
                                fields={fields}
                                field={configureField}
                                onFieldUpdated={(field: Field) => {
                                    const updatedFields = [...fields]
                                    const fieldIndex = updatedFields.findIndex((f) => f.fieldId === configureField.fieldId)
                                    updatedFields[fieldIndex] = field
                                    if (field.title) {
                                        updatedFields.forEach((item, index) => {
                                            if (index !== fieldIndex) {
                                                updatedFields[index].title = false
                                            }
                                        })
                                    }
                                    setFields(updatedFields)
                                }}
                                onDeleteField={(field) => {
                                    const updatedFields = [...fields].filter((f) => f.fieldId !== field.fieldId)
                                    setFields(updatedFields)
                                }}
                            ></ConfigureField>
                        )}

                        <SaveMenuBar
                            positiveText={t("content_type_configure_savebar_save")}
                            neutralText={t("content_type_configure_savebar_close")}
                            positiveLoading={isSaveLoading}
                            onClose={() => {
                                router.push(`/portal/spaces/${params.spaceid}/contenttype`)
                            }}
                            onNeutral={() => {
                                router.push(`/portal/spaces/${params.spaceid}/contenttype`)
                            }}
                            onPositive={async () => {
                                await save()
                            }}
                        >
                            <HStack spacing={2}>
                                <Box as="span">{t("content_type_configure_savebar_heading")}</Box>
                                <Box as="span" fontWeight={"bold"}>
                                    {contenttype.name}
                                </Box>
                            </HStack>
                        </SaveMenuBar>

                        <Modal isOpen={isInterfaceOpen} onClose={onInterfaceClose} isCentered={true}>
                            <ModalOverlay />
                            <ModalContent maxW="600px">
                                <ModalHeader pt={10} px={10} pb={0}>
                                    {t("content_type_configure_typescript_interface")}
                                </ModalHeader>
                                <ModalCloseButton right={10} top={10} />
                                <ModalBody overflow="auto" p={10}>
                                    <CodeBlock text={dataSchema} theme={monokai} language="typescript" />
                                </ModalBody>

                                <ModalFooter pb={10} px={10} gap={10}>
                                    <CopyToClipboard
                                        text={dataSchema}

                                        onCopy={() =>
                                            toast({
                                                title: t("content_type_configure_typescript_interface_copied"),
                                                status: "info",
                                                position: "bottom-right",
                                            })
                                        }
                                    >

                                        <Button variant={"ghost"}>
                                            <Tooltip label={t("content_type_configure_typescript_interface_copy")}>
                                                {t("content_type_configure_typescript_interface_copy")}
                                            </Tooltip>
                                        </Button>

                                    </CopyToClipboard>

                                    <Button
                                        colorScheme="blue"
                                        onClick={() => {
                                            onInterfaceClose()
                                        }}
                                    >
                                        {t("content_type_configure_typescript_close")}
                                    </Button>
                                </ModalFooter>
                            </ModalContent>
                        </Modal>

                        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered={true}>
                            <ModalOverlay />
                            <ModalContent maxW="600px">
                                <ModalHeader pt={10} px={10} pb={0}>
                                    {t("content_type_configure_typescript_delete_heading")}
                                </ModalHeader>
                                <ModalCloseButton right={10} top={10} />
                                <ModalBody overflow="auto" p={10}>
                                    <VStack alignItems={"flex-start"} spacing={5}>
                                        <Box>{t("content_type_configure_typescript_delete_description")}</Box>
                                    </VStack>
                                </ModalBody>

                                <ModalFooter pb={10} px={10} gap={10}>
                                    <Button
                                        isLoading={isDeleteLoading}
                                        colorScheme="red"
                                        mr={3}
                                        minW="150px"
                                        onClick={async () => {
                                            setIsDeleteLoading(true)
                                            try {
                                                await apiClient.delete({
                                                    path: `/space/${params.spaceid}/contenttype/${params.contenttypeid}`,
                                                    isAuthRequired: true,
                                                })
                                                toast({
                                                    title: t("content_type_configure_typescript_delete_success", name),
                                                    status: "success",
                                                    position: "bottom-right",
                                                })
                                                setIsDeleteLoading(false)
                                                queryClient.removeQueries([["contenttypes", params.spaceid]])
                                                router.back()
                                            } catch (ex) {
                                                setIsDeleteLoading(false)
                                                toast({
                                                    title: t("content_type_configure_typescript_delete_error_title"),
                                                    description: t("content_type_configure_typescript_delete_error_description"),
                                                    status: "error",
                                                    position: "bottom-right",
                                                })
                                            }
                                        }}
                                    >
                                        {t("content_type_configure_typescript_delete_error_button")}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            onDeleteClose()
                                        }}
                                    >
                                        {t("cancel")}
                                    </Button>
                                </ModalFooter>
                            </ModalContent>
                        </Modal>

                        <Box backgroundColor={"#fff"} minH={"100vh"} pt="120px" pb={"50px"}>
                            <Container maxW="1000px">
                                <VStack w="100%" spacing="60px">
                                    <Grid templateColumns="3fr 2fr" rowGap="60px" columnGap={20} w="100%">
                                        <GridItem>
                                            <TextInput subject={t("content_type_configure_fields_name_subject")} placeholder={t("content_type_configure_fields_name_placeholder")} value={name} onChange={setName} focus={true}></TextInput>
                                        </GridItem>
                                        <GridItem>
                                            <TextInput subject="contentTypeId" value={contenttype.contentTypeId} disabled={true} enableCopy={true}></TextInput>
                                        </GridItem>
                                        <GridItem>
                                            <SimpleCheckboxInput
                                                subject={t("content_type_configure_fields_enabled_subject")}
                                                checked={enabled}
                                                onChange={setEnabled}
                                                description={t("content_type_configure_fields_enabled_description")}
                                            ></SimpleCheckboxInput>
                                        </GridItem>
                                        <GridItem></GridItem>
                                        <GridItem>
                                            <SimpleCheckboxInput
                                                subject={t("content_type_configure_fields_slug_subject")}
                                                checked={generateSlug}
                                                onChange={setGenerateSlug}
                                                description={t("content_type_configure_fields_slug_description")}
                                            ></SimpleCheckboxInput>
                                        </GridItem>
                                        <GridItem></GridItem>
                                        <GridItem>
                                            <SimpleCheckboxInput
                                                subject={t("content_type_configure_fields_hidden_subject")}
                                                checked={hidden}
                                                onChange={setHidden}
                                                description={t("content_type_configure_fields_hidden_description")}
                                            ></SimpleCheckboxInput>
                                        </GridItem>
                                        <GridItem></GridItem>
                                        <GridItem>
                                            <CheckboxInput
                                                subject={t("content_type_configure_fields_preview_subject")}
                                                checked={showExternalPreview}
                                                onChange={setShowExternalPreview}
                                                align="top"
                                                checkedBody={<Box>
                                                    <TextInput subject="" description={t("content_type_configure_fields_preview_checked_description")} value={externalPreview} onChange={setExternalPreview} ></TextInput>
                                                </Box>
                                                }
                                                uncheckedBody={<Box fontSize="14px" color={"gray.500"} onClick={() => {
                                                    setShowExternalPreview(true)
                                                }}>
                                                    {t("content_type_configure_fields_preview_unchecked_description")}
                                                </Box>}

                                            ></CheckboxInput>
                                        </GridItem>
                                        <GridItem></GridItem>
                                    </Grid>

                                    <Box w="100%">
                                        <VStack w="100%" spacing={3} alignItems="flex-start">
                                            <HStack w="100%">
                                                <Box flex={1}>{t("content_type_configure_fields_list_heading")}</Box>
                                                <Button colorScheme="blue" minW="120px" onClick={onCreateOpen}>
                                                    {t("content_type_configure_fields_list_add")}
                                                </Button>
                                            </HStack>
                                            {fields.length > 0 ? (
                                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                                    <Table w="100%">
                                                        <Thead>
                                                            <Tr>
                                                                <Th width="20px" padding={0}></Th>
                                                                <Th>{t("content_type_configure_fields_list_table_heading_name")}</Th>
                                                                <Th>{t("content_type_configure_fields_list_table_heading_id")}</Th>

                                                                <Th></Th>
                                                            </Tr>
                                                        </Thead>
                                                        <Tbody>
                                                            <SortableContext items={sortableFields} strategy={verticalListSortingStrategy}>
                                                                {fields.map((f) => (
                                                                    <SortableItem
                                                                        id={f.fieldId}
                                                                        key={f.fieldId}
                                                                        f={f}
                                                                        onConfigure={() => {
                                                                            const field = fields.find((d) => d.fieldId === f.fieldId)
                                                                            if (!field) return
                                                                            setConfigureField({ ...field })
                                                                            onConfigureOpen()
                                                                        }}
                                                                    ></SortableItem>
                                                                ))}
                                                            </SortableContext>
                                                        </Tbody>
                                                    </Table>
                                                </DndContext>
                                            ) : (
                                                <Empty message={t("content_type_configure_fields_list_table_empty")}></Empty>
                                            )}
                                        </VStack>
                                    </Box>

                                    <Grid templateColumns="3fr 2fr" rowGap="60px" columnGap={20} w="100%">
                                        <GridItem>
                                            <Box w="100%">
                                                <Box mb={3}>{t("content_type_configure_dangerzone_title")}</Box>

                                                {contenttype.used ? (
                                                    <Box fontSize={"14px"} color="red.300">
                                                        <Box>{t("content_type_configure_dangerzone_description1")}</Box>
                                                        <Box>{t("content_type_configure_dangerzone_description2")}</Box>
                                                    </Box>
                                                ) : (
                                                    <Button leftIcon={<Trash></Trash>} onClick={onDeleteOpen}>
                                                        {t("content_type_configure_dangerzone_button")}
                                                    </Button>
                                                )}
                                            </Box>
                                        </GridItem>

                                        <GridItem>
                                            <Box mb={3}>{t("content_type_configure_typescript_heading")}</Box>
                                            <HStack>
                                                <Button
                                                    onClick={() => {
                                                        onInterfaceOpen();
                                                    }}
                                                >
                                                    {t("content_type_configure_typescript_button")}
                                                </Button>
                                                <CopyToClipboard
                                                    text={dataSchema}

                                                    onCopy={() =>
                                                        toast({
                                                            title: t("content_type_configure_typescript_interface_copied"),
                                                            status: "info",
                                                            position: "bottom-right",
                                                        })
                                                    }
                                                >

                                                    <Button variant={"ghost"} w="60px">
                                                        <Tooltip label={t("content_type_configure_typescript_interface_copy")}>
                                                            <Copy></Copy>
                                                        </Tooltip>
                                                    </Button>

                                                </CopyToClipboard>
                                            </HStack>
                                        </GridItem>
                                        <GridItem></GridItem>
                                    </Grid>
                                </VStack>
                            </Container>
                        </Box>
                    </>
                )
            )}
        </>
    )
}

function SortableItem({ f, id, onConfigure }: { f: Field; id: string; onConfigure: () => void }) {
    const { t } = usePhrases();
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <Tr _hover={{ backgroundColor: "#fff", cursor: "pointer" }} key={f.fieldId} id={f.fieldId} onClick={() => { }} ref={setNodeRef} style={style}>
            <Td color="gray.400" padding={0} cursor="grab" {...attributes} {...listeners}>
                <AlignJustify></AlignJustify>
            </Td>
            <Td
                fontWeight="600"
                justifyContent={"center"}
                onClick={() => {
                    onConfigure()
                }}
            >
                <Flex alignItems={"center"}>
                    {f.name}
                    {f.title && (
                        <Tag colorScheme="blue" ml={5}>
                            {t("content_type_configure_fields_list_table_title")}
                        </Tag>
                    )}
                </Flex>
            </Td>
            <Td
                onClick={() => {
                    onConfigure()
                }}
            >
                {f.fieldId}
            </Td>

            <Td
                textAlign={"right"}
                onClick={() => {
                    onConfigure()
                }}
            >
                <Button variant={"ghost"}>
                    <HStack spacing={3}>
                        <Box color="blue.500">{t("content_type_configure_fields_list_table_settings")}</Box>

                        <Sliders size={24} />
                    </HStack>
                </Button>
            </Td>
        </Tr>
    )
}
