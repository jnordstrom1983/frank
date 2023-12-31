"use client"
import { PutContentItemErrorItem, PutContentItemRequest, PutContentItemResponse } from "@/app/api/space/[spaceid]/content/[contentid]/put"
import { CheckboxInput } from "@/components/CheckboxInput"
import { SaveMenuBar } from "@/components/SaveMenuBar"
import { ContentData } from "@/models/contentdata"
import { SpaceLanguage } from "@/models/space"
import { apiClient } from "@/networking/ApiClient"
import { useContentItem } from "@/networking/hooks/content"
import { useContenttype } from "@/networking/hooks/contenttypes"
import { useSpaces } from "@/networking/hooks/spaces"
import { useAppStore } from "@/stores/appStore"
import {
    Box,
    Button,
    Center,
    Container,
    Divider,
    Flex,
    HStack,
    Menu,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Spinner,
    Stack,
    Tag,
    Tooltip,
    VStack,
    useDisclosure,
    useToast
} from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Check, Clock, Flag, MessageCircle, PlusCircle, Sliders, Trash, X } from "react-feather"
import { v4 as uuidv4 } from "uuid"
import TextInput from "../TextInput"
import { ContentEditorManager } from "./ContentEditorManager"

import { PostFolderRequest, PostFolderResponse } from "@/app/api/space/[spaceid]/folder/post"
import { SpaceItem } from "@/app/api/space/get"
import { getAllLangauges, usePhrases } from "@/lib/lang"
import { padZero } from "@/lib/utils"
import { AIModule } from "@/models/ai"
import { useFolders } from "@/networking/hooks/folder"
import { SingleDatepicker } from "chakra-dayzed-datepicker"
import relativeTime from "dayjs/plugin/relativeTime"
import { z } from "zod"
import { AI } from "../AI/AI/AI"
dayjs.extend(relativeTime)

interface valdationError {
    language: string
    fieldId: string
}
export default function Editor({
    spaceId,
    contentId,
    onBack,
    onSaved,
    layout = "row",
    showSaveBar = true,
    tools = {
        published: true,
        language: true,
        ai: true,
        history: true,
        folder: true,
        delete: true,
        slug: true,
        save: false,
        preview : true,
    },
    onSave,
    onTitleChange,
}: {
    spaceId: string
    contentId: string
    onBack?: () => void
    onSaved?: () => void
    layout?: "column" | "row"
    showSaveBar?: boolean
    tools?: { published: boolean; language: boolean; ai: boolean; history: boolean; folder: boolean; delete: boolean; save: boolean; slug: boolean; preview : boolean }
    onTitleChange?: (title: string) => void
    onSave?: (data: PutContentItemRequest) => boolean
}) {
    const { showMainMenu, hideMainMenu } = useAppStore((state) => state)
    const { t } = usePhrases();
    const router = useRouter()
    const toast = useToast()
    const [isSaveLoading, setIsSaveLoading] = useState<boolean>(false)
    const queryClient = useQueryClient()
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const { item: content, isLoading: isContentLoading } = useContentItem(spaceId, contentId, {})
    const { spaces, isLoading: isSpacesLoading } = useSpaces({})
    const [space, setSpace] = useState<SpaceItem>()
    const { folders, isLoading: isFoldersLoading } = useFolders(spaceId, {})
    const [contentDatas, setContentDatas] = useState<ContentData[]>([])
    const [updatedContentDatas, setUpdatedContentDatas] = useState<ContentData[]>([])
    const [published, setPublished] = useState<boolean>(false)
    const { contenttype, isLoading: isContentTypeLoading } = useContenttype(spaceId, content?.content.contentTypeId || "", { disabled: !content })
    const [currentLanguage, setCurrentLanguage] = useState<SpaceLanguage>("en")
    const [lastCurrentLanguage, setLastCurrentLanguage] = useState<SpaceLanguage>("en")
    const [languages, setLanguages] = useState<SpaceLanguage[]>([])
    const [title, setTitle] = useState<string>("")
    const [showValidation, setShowValidation] = useState<boolean>(false)
    const [serverSideErrors, setServersideErrors] = useState<PutContentItemErrorItem[]>([])
    const [showLanguages, setShowLanguages] = useState<boolean>(false)
    const [errors, setErrors] = useState<valdationError[]>([])
    const [folder, setFolder] = useState<string>("")
    const [folderOptions, setFolderOptions] = useState<{ key: string; text: string }[]>([])
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
    const { isOpen: isUnsavedOpen, onOpen: onUnsavedOpen, onClose: onUnsavedClose } = useDisclosure()
    const { isOpen: isScheduleOpen, onOpen: onScheduleOpen, onClose: onScheduleClose } = useDisclosure()
    const { isOpen: isCreateFolderOpen, onOpen: onCreateFolderOpen, onClose: onCreateFolderClose } = useDisclosure()
    const { isOpen: isCopyLanguageOpen, onOpen: onCopyLanguageOpen, onClose: onCopyLanguageClose } = useDisclosure()
    const [publishDate, setPublishDate] = useState<Date | undefined>(undefined)
    const [DepublishDate, setDepublishDate] = useState<Date | undefined>(undefined)
    const [copyContentLanguages, setCopyContentLanguages] = useState<SpaceLanguage[]>([])
    const [copyLanguageFrom, setCopyLanguageFrom] = useState<SpaceLanguage>("en")
    const [createFolderName, setCreateFolderName] = useState<string>("")
    const [createFolderLoading, setCreateFolderLoading] = useState<boolean>(false)
    const [createFolderValid, setCreateFolderValid] = useState<boolean>(false)

    const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false)
    const [showAI, setShowAI] = useState<boolean>(false)
    const [ActiveAIModule, setActiveAIModule] = useState<AIModule>("check")
    const [hasChanges, setHasChanges] = useState<boolean>(false)
    const [initialized, setInitilized] = useState<boolean>(false)
    const allLanguages = getAllLangauges()
    function getTitle() {
        if (!contenttype) return ""
        if (!updatedContentDatas) return ""
        if (!spaces) return ""

        const titleField = contenttype.fields.find((f) => f.title)
        if (!titleField) return ""

        const lang = updatedContentDatas.find((p) => p.languageId === space!.defaultLanguage)
        if (!lang) return ""

        return getTitleMaxLength(lang.data[titleField.fieldId] || "")
    }

    function getTitleMaxLength(title: string) {
        if (title.length > 25) {
            return `${title.substring(0, 23)}...`
        }
        return title
    }

    useEffect(() => {
        if (!showSaveBar) return
        hideMainMenu()
        return () => {
            showMainMenu()

            queryClient.removeQueries([["content", contentId]])
        }
    }, [])
    useEffect(() => {
        setShowAI(false)
    }, [currentLanguage])
    useEffect(() => {
        if (!contenttype) return
        if (!content) return
        if (!spaces) return
        if (initialized) return

        const space = spaces.find((p) => p.spaceId === spaceId)
        if (!space) {
            throw "Space not found"
        }
        setSpace(space)

        let langs = [space.defaultLanguage]
        content.contentData.forEach((c) => {
            if (!langs.includes(c.languageId)) langs = [...langs, c.languageId]
        })
        setLanguages([...langs])
        setCurrentLanguage(space.defaultLanguage)
        setLastCurrentLanguage(space.defaultLanguage)
        setContentDatas([...content.contentData])
        setUpdatedContentDatas([...content.contentData])
        setPublished(content.content.status === "published")
        setFolder(content.content.folderId || "")
        setPublishDate(content.content.scheduledPublishDate ? new Date(content.content.scheduledPublishDate) : undefined)
        setDepublishDate(content.content.scheduledDepublishDate ? new Date(content.content.scheduledDepublishDate) : undefined)

        setInitilized(true)
        setIsLoading(false)
    }, [content, contenttype, spaces])

    useEffect(() => {
        if (!folders) return
        if (!content) return

        let folderOptions = folders
            .filter((f) => {
                if (f.contentTypes.length === 0) return true
                if (f.contentTypes.includes(content.content.contentTypeId)) return true
                return false
            })
            .map((f) => ({ key: f.folderId, text: f.name }))
            .sort((f1, f2) => {
                if (f1.text > f2.text) return 1
                if (f1.text < f2.text) return -1
                return 0
            })

        setFolderOptions([{ key: "", text: t("editor_space_nofolder") }, ...folderOptions])
    }, [folders, content])

    useEffect(() => {
        const title = getTitle()
        setTitle(title)
        onTitleChange && onTitleChange(title)
    }, [updatedContentDatas])

    useEffect(() => {
        if (!updatedContentDatas) return
        if (lastCurrentLanguage === currentLanguage) return
        setContentDatas([...updatedContentDatas])
        setLastCurrentLanguage(currentLanguage)
    }, [lastCurrentLanguage, currentLanguage, updatedContentDatas])

    useEffect(() => {
        const currentContentData = updatedContentDatas.find((p) => p.languageId === currentLanguage)
        setSlug(currentContentData?.slug || "")
    }, [currentLanguage, updatedContentDatas])

    async function save() {
        let body: PutContentItemRequest = {
            status: published ? "published" : "draft",
            data: contentDatas
                .filter((item) => languages.find((p) => p === item.languageId))
                .map((item) => {
                    return {
                        languageId: item.languageId,
                        data: item.data,
                        slug: item.slug,
                    }
                }),
        }
        if (folder !== "") {
            body = { ...body, folderId: folder }
        }

        if (publishDate) {
            body = { ...body, scheduledPublishDate: publishDate }
        }
        if (DepublishDate) {
            body = { ...body, scheduledDepublishDate: DepublishDate }
        }

        setServersideErrors([])

        setIsSaveLoading(true)
        try {
            if (onSave) {
                onSave(body)
            } else {
                const content = await apiClient.put<PutContentItemResponse, PutContentItemRequest>({
                    path: `/space/${spaceId}/content/${contentId}`,
                    isAuthRequired: true,
                    body,
                })
                setIsSaveLoading(false)
                queryClient.invalidateQueries([["content", spaceId]])
                queryClient.invalidateQueries([["content", contentId]])
            }
            onSaved && onSaved()
        } catch (ex) {
            if ((ex as any).error) {
                if (Array.isArray((ex as any).error)) {
                    if ((ex as any).error.length > 0) {
                        setServersideErrors((ex as any).error as PutContentItemErrorItem[])
                        setIsSaveLoading(false)
                        toast({
                            title: t("editor_save_validation_error_title"),
                            description: t("editor_save_validation_error_description"),
                            status: "warning",
                            position: "bottom-right",
                        })

                        return
                    }
                }
            }
            setIsSaveLoading(false)
            toast({
                title: t("editor_save_error_title"),
                description: t("editor_save_error_desscription"),
                status: "error",
                position: "bottom-right",
            })
        }
    }

    const [slug, setSlug] = useState<string>("")
    function updateSlug(slug: string) {
        let datas = [...updatedContentDatas]
        const updatedLanguage = datas.find((p) => p.languageId === currentLanguage)
        if (updatedLanguage) {
            updatedLanguage.slug = slug
        } else {
            const dataItem = {
                spaceId: spaceId,
                contentDataId: uuidv4(),
                contentTypeId: contenttype!.contentTypeId,
                contentId: contentId,
                languageId: currentLanguage,
                modifiedUserId: "",
                modifiedDate: new Date(),
                data: {},
                slug: slug,
            }
            //@ts-ignore
            datas.push(dataItem)
        }

        setUpdatedContentDatas([...datas])
        setContentDatas([...datas])

        setSlug(slug)
    }

    async function createFolder() {
        setCreateFolderLoading(true)
        try {
            const response = await apiClient.post<PostFolderResponse, PostFolderRequest>({
                path: `/space/${spaceId}/folder`,
                isAuthRequired: true,
                body: {
                    name: createFolderName,
                },
            })
            queryClient.invalidateQueries([["folders", spaceId]])
            setCreateFolderLoading(false)
            onCreateFolderClose()
            setFolder(response.folderId)
            toast({
                title: t("editor_folder_create_save_success"),
                status: "success",
                position: "bottom-right",
            })
        } catch (ex) {
            setCreateFolderLoading(false)
            toast({
                title: t("editor_folder_create_save_error_title"),
                description: t("editor_folder_create_save_error_description"),
                status: "error",
                position: "bottom-right",
            })
            return
        }
    }

    return (
        <>
            {isLoading ? (
                <Center h={showSaveBar ? "100vh" : "100%"} w="100%">
                    <Spinner size="xl" colorScheme="blue"></Spinner>
                </Center>
            ) : (
                content &&
                contenttype && (
                    <>
                        {showAI && (
                            <Box pt={20}>
                                <AI
                                    datas={updatedContentDatas}
                                    module={ActiveAIModule}
                                    spaceId={spaceId}
                                    language={currentLanguage}
                                    contentType={contenttype}
                                    updateDatas={(datas) => {
                                        setUpdatedContentDatas([...datas])
                                        setContentDatas([...datas])
                                        setHasChanges(true)
                                    }}
                                    onClose={() => {
                                        setShowAI(false)
                                    }}
                                ></AI>
                            </Box>
                        )}

                        <EditorScheduling
                            isScheduleOpen={isScheduleOpen}
                            ScheduledPublish={publishDate}
                            ScheduledDepublish={DepublishDate}
                            onScheduleClose={onScheduleClose}
                            onChange={(data) => {
                                setPublishDate(data.PublishDate)
                                setDepublishDate(data.DepublishDate)
                            }}
                        ></EditorScheduling>

                        <Modal isOpen={isCopyLanguageOpen} onClose={onCopyLanguageClose} isCentered={true}>
                            <ModalOverlay />
                            <ModalContent maxW="600px">
                                <ModalHeader pt={10} px={10} pb={0}>
                                    {t("editor_copycontent_heading")}
                                </ModalHeader>
                                <ModalCloseButton right={10} top={10} />
                                <ModalBody overflow="auto" p={10}>
                                    <VStack alignItems={"flex-start"} spacing={5}>
                                        <Box>{t("editor_copycontent_description")}</Box>
                                        <TextInput
                                            subject={t("editor_copycontent_copyfrom")}
                                            value={copyLanguageFrom}
                                            type="select"
                                            options={allLanguages
                                                .filter((l) => languages.find((x) => x === l.code))
                                                .filter((l) => !copyContentLanguages.find((p) => p === l.code))
                                                .map((p) => ({ key: p.code, text: p.name }))}
                                            focus={true}
                                            onChange={(v) => {
                                                setCopyLanguageFrom(v as SpaceLanguage)
                                            }}
                                            onSubmit={createFolder}
                                        ></TextInput>
                                    </VStack>
                                </ModalBody>

                                <ModalFooter pb={10} px={10} gap={10}>
                                    <Button
                                        colorScheme="blue"
                                        mr={3}
                                        minW="150px"
                                        onClick={async () => {
                                            const addedLanguages = copyContentLanguages

                                            const defLanguage = updatedContentDatas.find((p) => p.languageId === copyLanguageFrom)

                                            if (defLanguage) {
                                                const updated = [...updatedContentDatas]

                                                addedLanguages.forEach((lang) => {
                                                    let dataItemIndex = updated.findIndex((p) => p.languageId === lang)
                                                    if (dataItemIndex > -1) {
                                                        updated[dataItemIndex].data = JSON.parse(JSON.stringify({ ...defLanguage.data }))
                                                    } else {
                                                        const dataItem = {
                                                            spaceId: spaceId,
                                                            contentDataId: uuidv4(),
                                                            contentTypeId: contenttype.contentTypeId,
                                                            contentId: contentId,
                                                            languageId: lang,
                                                            modifiedUserId: "",
                                                            modifiedDate: new Date(),
                                                            data: JSON.parse(JSON.stringify({ ...defLanguage.data })),
                                                            slug: defLanguage.slug,
                                                        }
                                                        //@ts-ignore
                                                        updated.push(dataItem)
                                                    }
                                                })

                                                setUpdatedContentDatas(updated)
                                                setHasChanges(true)
                                            }
                                            onCopyLanguageClose()
                                        }}
                                    >
                                        {t("editor_copycontent_copy")}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            onCopyLanguageClose()
                                        }}
                                    >
                                         {t("editor_copycontent_donotcopy")}
                                        
                                    </Button>
                                </ModalFooter>
                            </ModalContent>
                        </Modal>

                        <Modal isOpen={isCreateFolderOpen} onClose={onCreateFolderClose} isCentered={true}>
                            <ModalOverlay />
                            <ModalContent maxW="600px">
                                <ModalHeader pt={10} px={10} pb={0}>
                                    {t("editor_folder_create_heading")}
                                </ModalHeader>
                                <ModalCloseButton right={10} top={10} />
                                <ModalBody overflow="auto" p={10}>
                                    <VStack alignItems={"flex-start"} spacing={5}>
                                        <TextInput
                                            subject={t("editor_folder_create_input_subject")}
                                            value={createFolderName}
                                            disabled={createFolderLoading}
                                            focus={true}
                                            onChange={setCreateFolderName}
                                            placeholder={t("editor_folder_create_input_placeholder")}
                                            validate={z.string().min(3)}
                                            onValidation={(valid) => {
                                                setCreateFolderValid(valid)
                                            }}
                                            onSubmit={createFolder}
                                        ></TextInput>
                                    </VStack>
                                </ModalBody>

                                <ModalFooter pb={10} px={10} gap={10}>
                                    <Button
                                        isLoading={createFolderLoading}
                                        isDisabled={createFolderLoading || !createFolderValid}
                                        colorScheme="green"
                                        mr={3}
                                        minW="150px"
                                        onClick={async () => {
                                            createFolder()
                                        }}
                                    >
                                        {t("editor_folder_create_button")}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            onCreateFolderClose()
                                        }}
                                    >
                                        {t("cancel")}
                                    </Button>
                                </ModalFooter>
                            </ModalContent>
                        </Modal>

                        <Modal isOpen={isUnsavedOpen} onClose={onUnsavedClose} isCentered={true}>
                            <ModalOverlay />
                            <ModalContent maxW="600px">
                                <ModalHeader pt={10} px={10} pb={0}>
                                    {t("editor_unsavedchanges_heading")}
                                </ModalHeader>
                                <ModalCloseButton right={10} top={10} />
                                <ModalBody overflow="auto" p={10}>
                                    <VStack alignItems={"flex-start"} spacing={5}>
                                        <Box>
                                            {t("editor_unsavedchanges_description")}
                                           
                                        </Box>
                                    </VStack>
                                </ModalBody>

                                <ModalFooter pb={10} px={10} gap={10}>
                                    <Button
                                        isLoading={isDeleteLoading}
                                        colorScheme="red"
                                        mr={3}
                                        minW="150px"
                                        onClick={async () => {
                                            onBack && onBack()
                                        }}
                                    >
                                         {t("editor_unsavedchanges_button")}
                                        
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            onUnsavedClose()
                                        }}
                                    >
                                        {t("cancel")}
                                    </Button>
                                </ModalFooter>
                            </ModalContent>
                        </Modal>

                        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered={true}>
                            <ModalOverlay />
                            <ModalContent maxW="600px">
                                <ModalHeader pt={10} px={10} pb={0}>
                                    {t("editor_delete_heading")}
                                </ModalHeader>
                                <ModalCloseButton right={10} top={10} />
                                <ModalBody overflow="auto" p={10}>
                                    <VStack alignItems={"flex-start"} spacing={5}>
                                        <Box>{t("editor_delete_description")}</Box>
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
                                                    path: `/space/${spaceId}/content/${contentId}`,
                                                    isAuthRequired: true,
                                                })
                                                toast({
                                                    title: t("editor_delete_success", getTitle()),
                                                    status: "success",
                                                    position: "bottom-right",
                                                })
                                                setIsDeleteLoading(false)

                                                queryClient.removeQueries([["content", spaceId]])
                                                queryClient.removeQueries([["content", contentId]])
                                                queryClient.removeQueries([["trash", spaceId]])
                                                onBack && onBack()
                                            } catch (ex) {
                                                setIsDeleteLoading(false)
                                                toast({
                                                    title: t("editor_delete_error_title"),
                                                    description: t("editor_delete_error_description"),
                                                    status: "error",
                                                    position: "bottom-right",
                                                })
                                            }
                                        }}
                                    >
                                        {t("editor_delete_button")}
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

                        {showSaveBar && (
                            <SaveMenuBar
                                positiveText={t("editor_savebar_save", published ? t("editor_savebar_and_publish") : t("editor_savebar_draft"))}
                                neutralText={t("editor_savebar_close")}
                                positiveLoading={isSaveLoading}
                                onClose={() => {
                                    if (hasChanges) {
                                        onUnsavedOpen()
                                        return
                                    }
                                    onBack && onBack()
                                }}
                                onNeutral={() => {
                                    if (hasChanges) {
                                        onUnsavedOpen()
                                        return
                                    }

                                    onBack && onBack()
                                }}
                                onPositive={async () => {
                                    if (errors.length > 0) {
                                        setShowValidation(true)
                                        toast({
                                            title: t("editor_savebar_save_error_title"),
                                            description: t("editor_savebar_save_error_description"),
                                            status: "warning",
                                            position: "bottom-right",
                                        })

                                        return
                                    }
                                    await save()
                                    setHasChanges(false)
                                }}
                            >
                                <HStack spacing={2}>
                                    <Box as="span">{t("editor_title")}</Box>
                                    <Box as="span" fontWeight={"bold"}>
                                        {title}
                                    </Box>
                                </HStack>
                            </SaveMenuBar>
                        )}
                        <Box backgroundColor={"#fff"} minH={showSaveBar ? "100vh" : undefined} pt={showSaveBar ? "120px" : undefined} pb={"50px"}>
                            <Container maxW="1000px">
                                <Stack direction={layout} w="100%" spacing="60px" alignItems={"flex-start"}>
                                    <Box w={layout === "row" ? "250px" : "100%"}>
                                        <Stack direction={layout === "row" ? "column" : "row"} spacing="60px" w="100%" alignItems={"flex-start"} justifyContent="flex-start">
                                            {tools.save && (
                                                <Box>
                                                    <VStack w="100%" alignItems={"flex-start"}>
                                                        <Box fontWeight="bold">{t("editor_tools_save_title")}</Box>
                                                        <Box>
                                                            <Button
                                                                colorScheme="green"
                                                                isLoading={isSaveLoading}
                                                                onClick={async () => {
                                                                    if (errors.length > 0) {
                                                                        setShowValidation(true)
                                                                        toast({
                                                                            title: t("editor_savebar_save_error_title"),
                                                                            description: t("editor_savebar_save_error_description"),
                                                                            status: "warning",
                                                                            position: "bottom-right",
                                                                        })

                                                                        return
                                                                    }
                                                                    await save()
                                                                    setHasChanges(false)
                                                                }}
                                                            >{t("editor_savebar_save", published ? t("editor_savebar_and_publish") : t("editor_savebar_draft"))}</Button>
                                                        </Box>
                                                    </VStack>
                                                </Box>
                                            )}
                                            {tools.published && (
                                                <Box>
                                                    <VStack w="100%" alignItems={"flex-start"}>
                                                        <HStack>
                                                            <Box fontWeight="bold">{t("editor_tools_publish_title")}</Box>
                                                            <Tooltip label="Schedule publishing / unpublishing" placement="top">
                                                                <Button
                                                                    variant={"ghost"}
                                                                    onClick={() => {
                                                                        onScheduleOpen()
                                                                    }}
                                                                >
                                                                    <Clock size={24} />
                                                                </Button>
                                                            </Tooltip>
                                                        </HStack>
                                                        <VStack spacing={5} w="100%" alignItems={"flex-start"}>
                                                            {publishDate ? (
                                                                <Box>
                                                                    <Tag colorScheme="green">{t("editor_tools_publish_scheduled")}</Tag> {t("editor_tools_publish_description")}{" "}
                                                                    {dayjs(publishDate).format("YYYY-MM-DD HH:mm")}.{" "}
                                                                    <Button
                                                                        variant={"ghost"}
                                                                        p={0}
                                                                        h={"auto"}
                                                                        color="blue.500"
                                                                        _hover={{ backgroundColor: "transparent", opacity: "0.8" }}
                                                                        _active={{ opacity: 0.5 }}
                                                                        onClick={() => {
                                                                            setPublished(true)
                                                                            setPublishDate(undefined)
                                                                        }}
                                                                    >
                                                                        {t("editor_tools_publish_button_publish_now")}
                                                                    </Button>
                                                                </Box>
                                                            ) : (
                                                                <Box>
                                                                    <CheckboxInput
                                                                        checked={published}
                                                                        onChange={setPublished}
                                                                        uncheckedBody={<Box>{t("editor_tools_publish_checkbox_isdraft")}</Box>}
                                                                        checkedBody={<Box>{t("editor_tools_publish_checkbox_ispublished")}</Box>}
                                                                    ></CheckboxInput>
                                                                </Box>
                                                            )}

                                                            {DepublishDate && (
                                                                <Box>
                                                                    <Tag colorScheme="red">{t("editor_tools_publish_scheduled")}</Tag> {t("editor_tools_depublish_description")}{" "}
                                                                    {dayjs(DepublishDate).format("YYYY-MM-DD HH:mm")}.
                                                                </Box>
                                                            )}
                                                        </VStack>
                                                    </VStack>
                                                </Box>
                                            )}

                                            {tools.preview && contenttype.externalPreview && (
                                                <Box>
                                                    <VStack w="100%" alignItems={"flex-start"}>
                                                        <Box fontWeight="bold">{t("editor_tools_preview_title")}</Box>
                                                        <Box>
                                                            <Button
                                                                
                                                                isLoading={isSaveLoading}
                                                                onClick={async () => {
                                                                  let form = document.createElement("form");
                                                                  form.method = "POST";
                                                                  form.action = contenttype.externalPreview || "";
                                                                  form.target = "_blank"
                                                                  

                                                                  const currentContentData = updatedContentDatas.find((p) => p.languageId === currentLanguage)
                                                                  
                                                                  let field=document.createElement('input');
                                                                  field.type='HIDDEN';
                                                                  field.name= "contentId";
                                                                  field.value = contentId;
                                                                  form.appendChild(field)

                                                                  if(currentContentData?.data){
                                                                    Object.keys(currentContentData.data).forEach(k=>{
                                                                        const value = currentContentData.data[k]
                                                                        let field=document.createElement('input');
                                                                        field.type='HIDDEN';
                                                                        field.name= k;
                                                                        field.value = value;
                                                                        form.appendChild(field)

                                                                    })
                                                                  }
                                                                  document.body.appendChild(form);
                                                                  form.submit();
                                                                  document.body.removeChild(form);

                                                                }}
                                                            >{t("editor_tools_preview_open")}</Button>
                                                        </Box>
                                                    </VStack>
                                                </Box>
                                            )}
                                            {tools.language && (
                                                <Box>
                                                    {showLanguages && (
                                                        <EditorLanguages
                                                            languages={languages}
                                                            defaultLanguage={languages[0] || "en"}
                                                            onClose={() => {
                                                                setShowLanguages(false)
                                                            }}
                                                            onChange={(newLangugaes) => {
                                                                const addedLanguages = newLangugaes.filter((l) => !languages.find((e) => e === l))

                                                       

                                                                setLanguages(newLangugaes)
                                                                if (!newLangugaes.find((p) => p === currentLanguage)) {
                                                                    setCurrentLanguage(newLangugaes[0])
                                                                }

                                                                if (addedLanguages.length > 0) {
                                                                    setCopyContentLanguages(addedLanguages)

                                                                    setCopyLanguageFrom(space!.defaultLanguage)
                                                                    onCopyLanguageOpen()
                                                                }


                                                                setShowLanguages(false)
                                                            }}
                                                        ></EditorLanguages>
                                                    )}

                                                    <VStack w="100%" alignItems={"flex-start"}>
                                                        <Box fontWeight="bold">
                                                            <HStack>
                                                                <Box>{t("editor_tools_language_title")}</Box>
                                                                <Tooltip label={t("editor_tools_language_tooltip")} placement="top">
                                                                    <Button
                                                                        variant="ghost"
                                                                        onClick={() => {
                                                                            setShowLanguages(true)
                                                                        }}
                                                                    >
                                                                        <Sliders></Sliders>
                                                                    </Button>
                                                                </Tooltip>
                                                            </HStack>
                                                        </Box>
                                                        <Flex flexWrap="wrap" gap="3">
                                                            {languages.map((l) => {
                                                                const languageName = allLanguages.find((al) => al.code === l)?.name || "N/A"
                                                                if (l === currentLanguage) {
                                                                    return (
                                                                        <Button colorScheme="blue" height="30px" padding={2} fontSize="12px" key={l}>
                                                                            {languageName}{" "}
                                                                            {showValidation && errors.find((p) => p.language === l) && (
                                                                                <Box backgroundColor="red.500" padding={1} ml={2} borderRadius="3px">
                                                                                    {errors.filter((p) => p.language === l).length}
                                                                                </Box>
                                                                            )}
                                                                        </Button>
                                                                    )
                                                                }
                                                                return (
                                                                    <Button
                                                                        variant="ghost"
                                                                        height="30px"
                                                                        padding={2}
                                                                        fontSize="12px"
                                                                        key={l}
                                                                        onClick={() => {
                                                                            setCurrentLanguage(l)
                                                                        }}
                                                                    >
                                                                        {languageName.toUpperCase()}
                                                                        {showValidation && errors.find((p) => p.language === l) && (
                                                                            <Box backgroundColor="red.500" padding={1} ml={2} borderRadius="3px">
                                                                                {errors.filter((p) => p.language === l).length}
                                                                            </Box>
                                                                        )}
                                                                    </Button>
                                                                )
                                                            })}
                                                        </Flex>
                                                    </VStack>
                                                </Box>
                                            )}

                                            {tools.folder && folderOptions.length > 1 && (
                                                <Box w="100%">
                                                    <VStack w="100%" alignItems={"flex-start"}>
                                                        <HStack>
                                                            <Box fontWeight="bold">{t("editor_tools_folder_title")}</Box>
                                                            <Button
                                                                variant={"ghost"}
                                                                onClick={() => {
                                                                    setCreateFolderName("")
                                                                    setCreateFolderValid(false)
                                                                    onCreateFolderOpen()
                                                                }}
                                                            >
                                                                <PlusCircle></PlusCircle>
                                                            </Button>
                                                        </HStack>

                                                        <Box w="100%">
                                                            <TextInput value={folder} type="select" onChange={setFolder} options={folderOptions}></TextInput>
                                                        </Box>
                                                    </VStack>
                                                </Box>
                                            )}

                                            {tools.ai && spaces?.find((s) => s.spaceId === spaceId)?.enableAi && (
                                                <Box>
                                                    <VStack w="100%" alignItems={"flex-start"}>
                                                        <Box fontWeight="bold">{t("editor_tools_ai_title")}</Box>
                                                        <Box>
                                                            <Flex flexWrap="wrap" gap="3">
                                                                <Button
                                                                    leftIcon={<Check></Check>}
                                                                    h={"40px"}
                                                                    fontSize="12px"
                                                                    p={2}
                                                                    onClick={() => {
                                                                        setActiveAIModule("check")
                                                                        setShowAI(true)
                                                                    }}
                                                                >
                                                                    {t("editor_tools_ai_check")}
                                                                </Button>
                                                                <Button
                                                                    leftIcon={<MessageCircle></MessageCircle>}
                                                                    h={"40px"}
                                                                    fontSize="12px"
                                                                    p={2}
                                                                    onClick={() => {
                                                                        setActiveAIModule("reprahse")
                                                                        setShowAI(true)
                                                                    }}
                                                                >
                                                                    {t("editor_tools_ai_rephrase")}
                                                                </Button>
                                                                {(languages[0] || "en") !== currentLanguage && (
                                                                    <Button
                                                                        leftIcon={<Flag></Flag>}
                                                                        h={"40px"}
                                                                        fontSize="12px"
                                                                        p={2}
                                                                        onClick={() => {
                                                                            setActiveAIModule("translate")
                                                                            setShowAI(true)
                                                                        }}
                                                                    >
                                                                        {t("editor_tools_ai_translate")}
                                                                    </Button>
                                                                )}
                                                            </Flex>
                                                        </Box>
                                                    </VStack>
                                                </Box>
                                            )}

                                            {tools.slug && contenttype.generateSlug && (
                                                <Box w="100%">
                                                    <VStack w="100%" alignItems={"flex-start"}>
                                                        <Box fontWeight="bold">{t("editor_tools_slug_title")}</Box>
                                                        <Box w="100%">
                                                            <TextInput value={slug} onChange={updateSlug} placeholder={t("editor_tools_slug_placeholder")} enableCopy={!!slug} copyMessage={t("editor_tools_slug_copy_message")}></TextInput>
                                                        </Box>
                                                    </VStack>
                                                </Box>
                                            )}

                                            {tools.delete && (
                                                <Box w="100%">
                                                    <VStack w="100%" alignItems={"flex-start"}>
                                                        <Box fontWeight="bold">{t("editor_tools_delete_title")}</Box>
                                                        <Box>
                                                            <Button leftIcon={<Trash></Trash>} onClick={onDeleteOpen}>
                                                                {t("editor_tools_delete_button")}
                                                            </Button>
                                                        </Box>
                                                    </VStack>
                                                </Box>
                                            )}

                                            {tools.history && content.historyItems.length > 0 && (
                                                <Box w="100%">
                                                    <VStack w="100%" alignItems={"flex-start"}>
                                                        <Box fontWeight="bold">
                                                            <HStack>
                                                                <Box>{t("editor_tools_history_title")}</Box>
                                                                <Tooltip label={t("editor_tools_history_tooltip")} placement="top">
                                                                    <Button
                                                                        variant="ghost"
                                                                        onClick={() => {
                                                                            router.push(`/portal/spaces/${spaceId}/content/${contentId}/history`)
                                                                        }}
                                                                    >
                                                                        <Clock></Clock>
                                                                    </Button>
                                                                </Tooltip>
                                                            </HStack>
                                                        </Box>
                                                        <VStack w="100%" alignItems={"flex-start"} divider={<Divider></Divider>}>
                                                            {content.historyItems.slice(0, 3).map((history, index) => (
                                                                <Button
                                                                    variant="ghost"
                                                                    w="100%"
                                                                    px="0"
                                                                    key={history.historyId}
                                                                    onClick={() => {
                                                                        router.push(`/portal/spaces/${spaceId}/content/${contentId}/history/${history.historyId}`)
                                                                    }}
                                                                >
                                                                    <HStack w="100%" spacing="3">
                                                                        <Box fontWeight={"bold"}>#{history.revision}</Box>
                                                                        <Box padding={1} borderRadius="3px" fontSize="12px" bgColor={"gray.200"}>
                                                                            {dayjs(history.date).fromNow()}
                                                                        </Box>
                                                                        <Box fontSize="12px" color="gray.500" flex={1} textAlign="right">
                                                                            ({history.changes} {history.changes > 1 ? t("editor_tools_history_changes") : t("editor_tools_history_change")})
                                                                        </Box>
                                                                    </HStack>
                                                                </Button>
                                                            ))}

                                                            {content.historyItems.length > 3 && (
                                                                <Button
                                                                    variant="ghost"
                                                                    w="100%"
                                                                    px="0"
                                                                    color="gray.500"
                                                                    onClick={() => {
                                                                        router.push(`/portal/spaces/${spaceId}/content/${contentId}/history`)
                                                                    }}
                                                                >
                                                                    <HStack w="100%" spacing="3">
                                                                        <Box fontWeight={"bold"}>{content.historyItems.length - 3}</Box>
                                                                        <Box>{t("editor_tools_history_more")} {content.historyItems.length > 4 ? t("editor_tools_history_changes") : t("editor_tools_history_change")}</Box>
                                                                    </HStack>
                                                                </Button>
                                                            )}
                                                        </VStack>
                                                    </VStack>
                                                </Box>
                                            )}
                                        </Stack>
                                    </Box>

                                    <Box flex={1} w={layout === "column" ? "100%" : undefined}>
                                        {serverSideErrors.length > 0 && (
                                            <Box pb={10}>
                                                <VStack w="100%" spacing={5}>
                                                    {serverSideErrors.map((e) => {
                                                        return (
                                                            <Box bgColor="red.400" color="#fff" w="100%" p={3} key={`${e.languageId}_${e.fieldId}`}>
                                                                {`${e.languageId}.${e.fieldId} - ${e.message}`}
                                                            </Box>
                                                        )
                                                    })}
                                                </VStack>
                                            </Box>
                                        )}

                                        <ContentEditorManager
                                            contentDatas={contentDatas}
                                            contentType={contenttype}
                                            language={currentLanguage}
                                            showValidation={showValidation}
                                            spaceId={spaceId}
                                            onDataChange={(data) => {
                                                const updated = [...updatedContentDatas]
                                                let dataItemIndex = updated.findIndex((p) => p.languageId === currentLanguage)
                                                if (dataItemIndex > -1) {
                                                    updated[dataItemIndex].data = data
                                                } else {
                                                    const dataItem = {
                                                        spaceId: spaceId,
                                                        contentDataId: uuidv4(),
                                                        contentTypeId: contenttype.contentTypeId,
                                                        contentId: contentId,
                                                        languageId: currentLanguage,
                                                        modifiedUserId: "",
                                                        modifiedDate: new Date(),
                                                        data: data,
                                                    }
                                                    //@ts-ignore
                                                    updated.push(dataItem)
                                                }
                                                setUpdatedContentDatas(updated)
                                                setHasChanges(true)
                                            }}
                                            onValidation={(fieldId, valid) => {
                                                setErrors((errors) => {
                                                    let newErrors: valdationError[] = [...errors].filter((p) => !(p.fieldId === fieldId && p.language === currentLanguage))

                                                    if (!valid) {
                                                        newErrors = [
                                                            ...newErrors,
                                                            {
                                                                fieldId: fieldId,
                                                                language: currentLanguage,
                                                            },
                                                        ]
                                                    }
                                                    return newErrors
                                                })
                                            }}
                                        ></ContentEditorManager>
                                    </Box>
                                </Stack>
                            </Container>
                        </Box>
                    </>
                )
            )}
        </>
    )
}

export function EditorLanguages({
    languages,
    onClose,
    onChange,
    defaultLanguage,
}: {
    languages: SpaceLanguage[]
    onClose: () => void
    onChange: (languages: SpaceLanguage[]) => void
    defaultLanguage: SpaceLanguage
}) {
    const allLanguages = getAllLangauges();
    const [text, setText] = useState<string>("")
    const [lang, setLang] = useState<string>("")
    const { t } = usePhrases();
    const [filteredLanguages, setFilteredLanguages] = useState<
        {
            code: string
            name: string
        }[]
    >([])
    const [internalLanguages, setInternalLanguages] = useState<SpaceLanguage[]>([])

    useEffect(() => {
        setInternalLanguages(languages)
    }, [languages])
    useEffect(() => {
        if (!text) {
            setFilteredLanguages([])
            return
        }
        let filteredLanguages = allLanguages.filter((l) => {
            return l.name.toLowerCase().includes(text.toLowerCase())
        })
        setFilteredLanguages(filteredLanguages)
    }, [text])
    function addLanguage(lang: SpaceLanguage) {
        const existing = internalLanguages.find((p) => p === lang)
        setText("")
        if (existing) return

        setInternalLanguages([...internalLanguages, lang])
    }

    return (
        <Modal isOpen={true} onClose={onClose} isCentered={true}>
            <ModalOverlay />
            <ModalContent maxW="600px">
                <ModalHeader pt={10} px={10} pb={0}>
                    {t("editor_languages_heading")}
                </ModalHeader>
                <ModalCloseButton right={10} top={10} />
                <ModalBody minH="200px" maxH="90vh" overflow="auto" p={10}>
                    <VStack w="100%" alignItems="flex-start">
                        <TextInput
                            placeholder={t("editor_languages_placeholder")}
                            value={text}
                            focus={true}
                            onChange={setText}
                            onSubmit={() => {
                                if (filteredLanguages.length === 0) return
                                addLanguage(filteredLanguages[0].code as SpaceLanguage)
                            }}
                        ></TextInput>
                        <Box position="absolute">
                            {filteredLanguages.length < 25 && filteredLanguages.length > 0 && (
                                <Menu isOpen={true}>
                                    <Box maxH="200px" w="520px" overflow="auto" borderRadius="5px" backgroundColor="#FAFAFA" zIndex={99} mt="55px" position="absolute">
                                        {filteredLanguages.map((l) => {
                                            return (
                                                <Box key={l.code} p={2} _hover={{ backgroundColor: "gray.100" }} w="100%">
                                                    <Button
                                                        w="100%"
                                                        justifyContent="left"
                                                        variant="gjost"
                                                        onClick={() => {
                                                            addLanguage(l.code as SpaceLanguage)
                                                        }}
                                                    >
                                                        {l.name}
                                                    </Button>
                                                </Box>
                                            )
                                        })}
                                    </Box>
                                </Menu>
                            )}
                        </Box>

                        <Flex flexWrap={"wrap"} gap={5}>
                            {internalLanguages.map((o) => (
                                <Box bg="gray.100" p={1} fontSize="12px" key={o}>
                                    <HStack spacing={1} w="100%">
                                        <Box pl={3}>{allLanguages.find((p) => p.code === o)?.name || o}</Box>
                                        <Button
                                            isDisabled={defaultLanguage === o}
                                            variant={"ghost"}
                                            onClick={() => {
                                                const newLangugaes = internalLanguages.filter((l) => l !== o)
                                                setInternalLanguages(newLangugaes)
                                            }}
                                        >
                                            <X size="16px"></X>
                                        </Button>
                                    </HStack>
                                </Box>
                            ))}
                        </Flex>
                    </VStack>
                </ModalBody>

                <ModalFooter pb={10} px={10} gap={10}>
                    <Button
                        colorScheme="green"
                        mr={3}
                        minW="150px"
                        onClick={() => {
                            onChange(internalLanguages)
                        }}
                    >
                        {t("editor_languages_update")}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            onClose()
                        }}
                    >
                        {t("cancel")}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

function EditorScheduling({
    ScheduledPublish,
    ScheduledDepublish,
    isScheduleOpen,
    onScheduleClose,
    onChange,
}: {
    ScheduledPublish?: Date
    ScheduledDepublish?: Date
    onScheduleClose: () => void
    isScheduleOpen: boolean
    onChange: (value: { PublishDate?: Date; DepublishDate?: Date }) => void
}) {
    const [ScheduleDate, setScheduleDate] = useState<Date>(new Date())
    const [ScheduleMinute, setScheduleMinute] = useState<number>(0)
    const [ScheduleHour, setScheduleHour] = useState<number>(0)
    const [SceduledDepublishDate, setSceduledDepublishDate] = useState<Date>(new Date())
    const [ScheduleDepublishMinute, setScheduleDepublishMinute] = useState<number>(0)
    const [ScheduleDepublishHour, setScheduleDepublishHour] = useState<number>(0)
    const [isScheduled, setIsScheduled] = useState<boolean>(false)
    const [isScheduledDepublish, setIsScheduledDepublish] = useState<boolean>(false)
    const { t } = usePhrases();
    useEffect(() => {
        if (ScheduledPublish) {
            setScheduleDate(ScheduledPublish)
            setScheduleHour(ScheduledPublish.getHours())
            setScheduleMinute(ScheduledPublish.getMinutes())
            setIsScheduled(true)
        } else {
            setIsScheduled(false)
        }

        if (ScheduledDepublish) {
            setSceduledDepublishDate(ScheduledDepublish)
            setScheduleDepublishHour(ScheduledDepublish.getHours())
            setScheduleDepublishMinute(ScheduledDepublish.getMinutes())
            setIsScheduledDepublish(true)
        } else {
            setIsScheduledDepublish(false)
        }
    }, [ScheduledPublish, ScheduledDepublish])

    let options: { key: string; text: string }[] = []
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 15) {
            options.push({ key: `${h}_${m}`, text: `${padZero(h, 2)}:${padZero(m, 2)}` })
        }
    }

    return (
        <Modal isOpen={isScheduleOpen} onClose={onScheduleClose} isCentered={true}>
            <ModalOverlay />
            <ModalContent maxW="600px">
                <ModalHeader pt={10} px={10} pb={0}>
                    {t("editor_schedule_heading")}
                </ModalHeader>
                <ModalCloseButton right={10} top={10} />
                <ModalBody overflow="auto" p={10}>
                    <VStack w="100%">
                        <VStack w="100%" spacing={10}>
                            <CheckboxInput
                                align="top"
                                subject={t("editor_schedule_publish_checkbox")}
                                checked={isScheduled}
                                onChange={(checked) => {
                                    setIsScheduled(checked)
                                }}
                                checkedBody={
                                    <Box>
                                        <VStack w="100%" alignItems={"flex-start"}>
                                            <Box fontSize="14px">{t("editor_schedule_publish_checkbox_yes_description")}</Box>
                                            <HStack w="100%">
                                                {" "}
                                                <SingleDatepicker
                                                    date={ScheduleDate}
                                                    onDateChange={(date) => {
                                                        const value = dayjs(date).toDate()
                                                        setScheduleDate(value)
                                                    }}
                                                    propsConfigs={{
                                                        weekdayLabelProps: {
                                                            color: "black",
                                                        },
                                                        dateHeadingProps: {
                                                            color: "black",
                                                        },
                                                        dayOfMonthBtnProps: {
                                                            defaultBtnProps: {
                                                                borderRadius: "50%",
                                                                width: "40px",
                                                                height: "40px",
                                                                _hover: {
                                                                    background: "gray.100",
                                                                    color: "black",
                                                                },
                                                            },

                                                            selectedBtnProps: {
                                                                backgroundColor: "blue.500",
                                                                color: "#fff",
                                                            },
                                                        },

                                                        popoverCompProps: {
                                                            popoverContentProps: {
                                                                color: "white",
                                                            },
                                                        },
                                                    }}
                                                ></SingleDatepicker>
                                                <TextInput
                                                    value={`${ScheduleHour}_${ScheduleMinute}`}
                                                    onChange={(value) => {
                                                        setScheduleHour(parseInt(value.split("_")[0]))
                                                        setScheduleMinute(parseInt(value.split("_")[1]))
                                                    }}
                                                    options={options}
                                                    type="select"
                                                ></TextInput>
                                            </HStack>
                                        </VStack>
                                    </Box>
                                }
                                uncheckedBody={
                                    <Box fontSize="14px" color="gray">
                                        {t("editor_schedule_publish_checkbox_no_description")}
                                    </Box>
                                }
                            ></CheckboxInput>

                            <CheckboxInput
                                align="top"
                                subject={t("editor_schedule_depublish_checkbox")}
                                checked={isScheduledDepublish}
                                onChange={(checked) => {
                                    setIsScheduledDepublish(checked)
                                }}
                                checkedBody={
                                    <Box>
                                        <VStack w="100%" alignItems={"flex-start"}>
                                            <Box fontSize="14px">{t("editor_schedule_depublish_checkbox_yes_description")}</Box>
                                            <HStack w="100%">
                                                {" "}
                                                <SingleDatepicker
                                                    date={SceduledDepublishDate}
                                                    onDateChange={(date) => {
                                                        const value = dayjs(date).toDate()
                                                        setSceduledDepublishDate(value)
                                                    }}
                                                    propsConfigs={{
                                                        weekdayLabelProps: {
                                                            color: "black",
                                                        },
                                                        dateHeadingProps: {
                                                            color: "black",
                                                        },
                                                        dayOfMonthBtnProps: {
                                                            defaultBtnProps: {
                                                                borderRadius: "50%",
                                                                width: "40px",
                                                                height: "40px",
                                                                _hover: {
                                                                    background: "gray.100",
                                                                    color: "black",
                                                                },
                                                            },

                                                            selectedBtnProps: {
                                                                backgroundColor: "blue.500",
                                                                color: "#fff",
                                                            },
                                                        },

                                                        popoverCompProps: {
                                                            popoverContentProps: {
                                                                color: "white",
                                                            },
                                                        },
                                                    }}
                                                ></SingleDatepicker>
                                                <TextInput
                                                    value={`${ScheduleDepublishHour}_${ScheduleDepublishMinute}`}
                                                    onChange={(value) => {
                                                        setScheduleDepublishHour(parseInt(value.split("_")[0]))
                                                        setScheduleDepublishMinute(parseInt(value.split("_")[1]))
                                                    }}
                                                    options={options}
                                                    type="select"
                                                ></TextInput>
                                            </HStack>
                                        </VStack>
                                    </Box>
                                }
                                uncheckedBody={
                                    <Box fontSize="14px" color="gray">
                                        {t("editor_schedule_depublish_checkbox_no_description")}
                                    </Box>
                                }
                            ></CheckboxInput>
                        </VStack>
                    </VStack>
                </ModalBody>

                <ModalFooter pb={10} px={10} gap={10}>
                    <Button
                        colorScheme="green"
                        mr={3}
                        minW="150px"
                        onClick={async () => {
                            const newSchduledDate = isScheduled
                                ? dayjs(`${dayjs(ScheduleDate).format("YYYY-MM-DD")} ${padZero(ScheduleHour, 2)}:${padZero(ScheduleMinute, 2)}:00`).toDate()
                                : undefined
                            const newSchduledDepublishDate = isScheduled
                                ? dayjs(
                                      `${dayjs(SceduledDepublishDate).format("YYYY-MM-DD")} ${padZero(ScheduleDepublishHour, 2)}:${padZero(ScheduleDepublishMinute, 2)}:00`
                                  ).toDate()
                                : undefined

                            const PublishData = {
                                PublishDate: isScheduled
                                    ? dayjs(`${dayjs(ScheduleDate).format("YYYY-MM-DD")} ${padZero(ScheduleHour, 2)}:${padZero(ScheduleMinute, 2)}:00`).toDate()
                                    : undefined,
                                DepublishDate: isScheduledDepublish
                                    ? dayjs(
                                          `${dayjs(SceduledDepublishDate).format("YYYY-MM-DD")} ${padZero(ScheduleDepublishHour, 2)}:${padZero(ScheduleDepublishMinute, 2)}:00`
                                      ).toDate()
                                    : undefined,
                            }

                            onChange(PublishData)
                            onScheduleClose()
                        }}
                    >
                        {t("editor_schedule_button")}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            onScheduleClose()
                        }}
                    >
                        {t("cancel")}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
