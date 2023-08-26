"use client"
import { PutContentItemErrorItem, PutContentItemRequest, PutContentItemResponse } from "@/app/api/space/[spaceid]/content/[contentid]/put"
import { CheckboxInput } from "@/components/CheckboxInput"
import { SaveMenuBar } from "@/components/SaveMenuBar"
import { languages as allLanguages } from "@/lib/constants"
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
    useDisclosure,
    useToast,
    VStack,
} from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import { Check, Clock, Flag, MessageCircle, Sliders, Trash, X, Zap } from "react-feather"
import { v4 as uuidv4 } from "uuid"
import TextInput from "../TextInput"
import { ContentEditorManager } from "./ContentEditorManager"
import dayjs from "dayjs"

import relativeTime from "dayjs/plugin/relativeTime"
import { useFolders } from "@/networking/hooks/folder"
import { AI } from "../AI/AI/AI"
import { AIModule } from "@/models/ai"
import { AITranslate } from "../AI/AI/AITranslate"
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
        slug : true,
        save: false,
        
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
    tools?: { published: boolean; language: boolean; ai: boolean; history: boolean, folder: boolean, delete: boolean, save: boolean, slug : boolean }
    onTitleChange?: (title: string) => void
    onSave?: (data: PutContentItemRequest) => boolean
}) {
    const { showMainMenu, hideMainMenu } = useAppStore((state) => state)

    const router = useRouter()
    const toast = useToast()
    const [isSaveLoading, setIsSaveLoading] = useState<boolean>(false)
    const queryClient = useQueryClient()
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const { item: content, isLoading: isContentLoading } = useContentItem(spaceId, contentId, {})
    const { spaces, isLoading: isSpacesLoading } = useSpaces({})
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
    const [folderOptions, setFolderOptions] = useState<{ key: string, text: string }[]>([])
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
    const { isOpen: isUnsavedOpen, onOpen: onUnsavedOpen, onClose: onUnsavedClose } = useDisclosure()
    const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false)
    const [showAI, setShowAI] = useState<boolean>(false);
    const [ActiveAIModule, setActiveAIModule] = useState<AIModule>("check")
    const [hasChanges, setHasChanges] = useState<boolean>(false)
    function getTitle() {
        if (!contenttype) return ""
        if (!updatedContentDatas) return ""
        if (!spaces) return ""

        const space = spaces.find((s) => s.spaceId === spaceId)
        if (!space) return ""

        const titleField = contenttype.fields.find((f) => f.title)
        if (!titleField) return ""

        const lang = updatedContentDatas.find((p) => p.languageId === space.defaultLanguage)
        if (!lang) return ""

        return getTitleMaxLength(lang.data[titleField.fieldId] || "")
    }

    function getTitleMaxLength(title : string){
        if(title.length > 25){
            return `${title.substring(0, 23)}...`
        }
        return title;
    }


    

    useEffect(() => {
        if (!showSaveBar) return;
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
        if (!folders) return
        const space = spaces.find((p) => p.spaceId === spaceId)
        if (!space) {
            throw "Space not found"
        }

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

        let folderOptions = folders.filter(f => {
            if (f.contentTypes.length === 0) return true;
            if (f.contentTypes.includes(content.content.contentTypeId)) return true;
            return false;
        }).map(f => ({ key: f.folderId, text: f.name })).sort((f1, f2) => {
            if (f1.text > f2.text) return 1;
            if (f1.text < f2.text) return -1;
            return 0
        })

        setFolderOptions([{ key: "", text: "No folder" }, ...folderOptions])


        setIsLoading(false)
    }, [content, contenttype, folders, spaces])
    

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

    useEffect(()=>{
        const currentContentData = updatedContentDatas.find(p=>p.languageId === currentLanguage)
        setSlug(currentContentData?.slug || "")
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
                        slug : item.slug
                    }
                }),
        }
        if (folder !== "") {
            body = { ...body, folderId: folder }
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
                            title: "Content not valid",
                            description: "Fix the errors and try again",
                            status: "warning",
                            position: "bottom-right",
                        })

                        return
                    }
                }
            }
            setIsSaveLoading(false)
            toast({
                title: "Could not save content",
                description: "Please try again.",
                status: "error",
                position: "bottom-right",
            })
        }
    }

    const [slug, setSlug] = useState<string>("")
    function updateSlug(slug : string){

        let datas = [...updatedContentDatas];
        const updatedLanguage = datas.find(p=>p.languageId === currentLanguage)
        if(updatedLanguage){
            updatedLanguage.slug = slug;
        }else{
            const dataItem = {
                spaceId: spaceId,
                contentDataId: uuidv4(),
                contentTypeId: contenttype!.contentTypeId,
                contentId: contentId,
                languageId: currentLanguage,
                modifiedUserId: "",
                modifiedDate: new Date(),
                data: {},
                slug : slug
            }
            //@ts-ignore
            datas.push(dataItem)
        }
        
        setUpdatedContentDatas([...datas])
        setContentDatas([...datas]);


        setSlug(slug)
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
                        {showAI &&

                            <Box pt={20}>

                                <AI datas={updatedContentDatas} module={ActiveAIModule} spaceId={spaceId} language={currentLanguage} contentType={contenttype} updateDatas={(datas) => {
                                    setUpdatedContentDatas([...datas])
                                    setContentDatas([...datas]);
                                    setHasChanges(true)
                                }} onClose={() => {
                                    console.log("on close called")
                                    setShowAI(false)
                                }}></AI>
                            </Box>

                        }

<Modal isOpen={isUnsavedOpen} onClose={onUnsavedClose} isCentered={true}>
                            <ModalOverlay />
                            <ModalContent maxW="600px">
                                <ModalHeader pt={10} px={10} pb={0}>
                                    Unsaved changes
                                </ModalHeader>
                                <ModalCloseButton right={10} top={10} />
                                <ModalBody overflow="auto" p={10}>
                                    <VStack alignItems={"flex-start"} spacing={5}>
                                        <Box>You have unsaved changes. If you close your content without saving you will loose your changes. Are you sure you wish to close the content?</Box>
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
                                        Yes, close
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => {

                                            onUnsavedClose()
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </ModalFooter>
                            </ModalContent>
                        </Modal>
                        

                        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered={true}>
                            <ModalOverlay />
                            <ModalContent maxW="600px">
                                <ModalHeader pt={10} px={10} pb={0}>
                                    Delete content
                                </ModalHeader>
                                <ModalCloseButton right={10} top={10} />
                                <ModalBody overflow="auto" p={10}>
                                    <VStack alignItems={"flex-start"} spacing={5}>
                                        <Box>Are you sure you wish to remove this content?</Box>
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
                                                    title: `${getTitle()} deleted.`,
                                                    status: "success",
                                                    position: "bottom-right",
                                                })
                                                setIsDeleteLoading(false)

                                                queryClient.removeQueries([["content", spaceId]])
                                                queryClient.removeQueries([["content", contentId]])
                                                onBack && onBack()
                                            } catch (ex) {
                                                setIsDeleteLoading(false)
                                                toast({
                                                    title: "Could not delete content",
                                                    description: "Please try again.",
                                                    status: "error",
                                                    position: "bottom-right",
                                                })
                                            }


                                        }}

                                    >
                                        Yes, delete
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => {

                                            onDeleteClose()
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </ModalFooter>
                            </ModalContent>
                        </Modal>


                        {showSaveBar && <SaveMenuBar
                            positiveText={`SAVE ${published ? "AND PUBLISH" : "DRAFT"}`}
                            neutralText="CLOSE"
                            positiveLoading={isSaveLoading}
                            onClose={() => {
                                
                                if(hasChanges){
                                    onUnsavedOpen();
                                    return;
                                }
                                onBack && onBack()
                            }}
                            onNeutral={() => {

                                if(hasChanges){
                                    onUnsavedOpen();
                                    return;
                                }


                                onBack && onBack()
                            }}
                            onPositive={async () => {
                                if (errors.length > 0) {
                                    setShowValidation(true)
                                    toast({
                                        title: "Content not valid",
                                        description: "Fix the errors and try again",
                                        status: "warning",
                                        position: "bottom-right",
                                    })

                                    return
                                }
                                await save()
                                setHasChanges(false);
                            }}
                        >
                            <HStack spacing={2}>
                                <Box as="span">Edit content</Box>
                                <Box as="span" fontWeight={"bold"}>
                                    {title}
                                </Box>
                            </HStack>
                        </SaveMenuBar>}
                        <Box backgroundColor={"#fff"} minH={showSaveBar ? "100vh" : undefined} pt={showSaveBar ? "120px" : undefined} pb={"50px"}>
                            <Container maxW="1000px">
                                <Stack direction={layout} w="100%" spacing="60px" alignItems={"flex-start"}>
                                    <Box w={layout === "row" ? "250px" : "100%"}>
                                        <Stack direction={layout === "row" ? "column" : "row"} spacing="60px" w="100%" alignItems={"flex-start"} justifyContent="flex-start">
                                            {tools.save && (

                                                <Box>
                                                    <VStack w="100%" alignItems={"flex-start"}>
                                                        <Box fontWeight="bold">SAVE</Box>
                                                        <Box>
                                                            <Button colorScheme="green" isLoading={isSaveLoading} onClick={async () => {
                                                                if (errors.length > 0) {
                                                                    setShowValidation(true)
                                                                    toast({
                                                                        title: "Content not valid",
                                                                        description: "Fix the errors and try again",
                                                                        status: "warning",
                                                                        position: "bottom-right",
                                                                    })

                                                                    return
                                                                }
                                                                await save()
                                                                setHasChanges(false)
                                                            }}>{`SAVE ${published ? "AND PUBLISH" : "DRAFT"}`}</Button>
                                                        </Box>
                                                    </VStack>
                                                </Box>


                                            )}
                                            {tools.published && (
                                                <Box>
                                                    <VStack w="100%" alignItems={"flex-start"}>
                                                        <Box fontWeight="bold">PUBLISHED</Box>
                                                        <Box>
                                                            <CheckboxInput
                                                                checked={published}
                                                                onChange={setPublished}
                                                                uncheckedBody={<Box>No, it's a draft</Box>}
                                                                checkedBody={<Box>Yes, it's published</Box>}
                                                            ></CheckboxInput>
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
                                                            onChange={(languages) => {
                                                                setLanguages(languages)
                                                                if (!languages.find((p) => p === currentLanguage)) {
                                                                    setCurrentLanguage(languages[0])
                                                                }
                                                                setShowLanguages(false)
                                                            }}
                                                        ></EditorLanguages>
                                                    )}

                                                    <VStack w="100%" alignItems={"flex-start"}>
                                                        <Box fontWeight="bold">
                                                            <HStack>
                                                                <Box>LANGUAGES</Box>
                                                                <Button
                                                                    variant="ghost"
                                                                    onClick={() => {
                                                                        setShowLanguages(true)
                                                                    }}
                                                                >
                                                                    <Sliders></Sliders>
                                                                </Button>
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
                                                        <Box fontWeight="bold">FOLDER</Box>
                                                        <Box w="100%">
                                                            <TextInput value={folder} type="select" onChange={setFolder} options={folderOptions}></TextInput>
                                                        </Box>
                                                    </VStack>
                                                </Box>
                                            )}

                                            {tools.ai && spaces?.find((s) => s.spaceId === spaceId)?.enableAi && (
                                                <Box>
                                                    <VStack w="100%" alignItems={"flex-start"}>
                                                        <Box fontWeight="bold">AI ASSISTANCE</Box>
                                                        <Box>
                                                            <Flex flexWrap="wrap" gap="3">
                                                                <Button leftIcon={<Check></Check>} h={"40px"} fontSize="12px" p={2} onClick={() => {
                                                                    setActiveAIModule("check");
                                                                    setShowAI(true);
                                                                }}>
                                                                    Check
                                                                </Button>
                                                                <Button leftIcon={<MessageCircle></MessageCircle>} h={"40px"} fontSize="12px" p={2} onClick={() => {
                                                                    setActiveAIModule("reprahse");
                                                                    setShowAI(true);
                                                                }}>
                                                                    Rephrase
                                                                </Button>
                                                                {(languages[0] || "en") !== currentLanguage &&
                                                                    <Button leftIcon={<Flag></Flag>} h={"40px"} fontSize="12px" p={2} onClick={() => {
                                                                        setActiveAIModule("translate");
                                                                        setShowAI(true);
                                                                    }}>
                                                                        Translate
                                                                    </Button>
                                                                }
                                                            </Flex>
                                                        </Box>
                                                    </VStack>
                                                </Box>
                                            )}

                                            {tools.slug && contenttype.generateSlug && (
                                                <Box>
                                                    <VStack w="100%" alignItems={"flex-start"}>
                                                        <Box fontWeight="bold">SLUG</Box>
                                                        <Box>
                                                            <TextInput value={slug} onChange={updateSlug} placeholder="Will be generated when saved"></TextInput>
                                                        </Box>
                                                    </VStack>
                                                </Box>
                                            )}


                                            {tools.folder && (
                                                <Box w="100%">
                                                    <VStack w="100%" alignItems={"flex-start"}>
                                                        <Box fontWeight="bold">DANGER ZONE</Box>
                                                        <Box>
                                                            <Button leftIcon={<Trash></Trash>} onClick={onDeleteOpen}>Delete</Button>
                                                        </Box>
                                                    </VStack>
                                                </Box>
                                            )}

                                            {tools.history && content.historyItems.length > 0 && (
                                                <Box w="100%">
                                                    <VStack w="100%" alignItems={"flex-start"}>
                                                        <Box fontWeight="bold">
                                                            <HStack>
                                                                <Box>HISTORY</Box>{" "}
                                                                <Button
                                                                    variant="ghost"
                                                                    onClick={() => {
                                                                        router.push(`/portal/spaces/${spaceId}/content/${contentId}/history`)
                                                                    }}
                                                                >
                                                                    <Clock></Clock>
                                                                </Button>
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
                                                                            ({history.changes} {history.changes > 1 ? "changes" : "change"})
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
                                                                        <Box>more {content.historyItems.length > 4 ? "changes" : "change"}</Box>
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
    const [text, setText] = useState<string>("")
    const [lang, setLang] = useState<string>("")

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
                    Languages
                </ModalHeader>
                <ModalCloseButton right={10} top={10} />
                <ModalBody minH="200px" maxH="90vh" overflow="auto" p={10}>
                    <VStack w="100%" alignItems="flex-start">
                        <TextInput
                            placeholder="Hit enter to add language"
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
                        Update
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            onClose()
                        }}
                    >
                        Cancel
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}