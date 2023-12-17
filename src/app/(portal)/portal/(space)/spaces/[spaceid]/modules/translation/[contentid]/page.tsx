"use client"
import { CheckboxInput } from "@/components/CheckboxInput"
import { SaveMenuBar } from "@/components/SaveMenuBar"
import { SelectionList } from "@/components/SelectionList"
import { SpaceLanguage } from "@/models/space"
import { useContentItem } from "@/networking/hooks/content"
import { useContenttype } from "@/networking/hooks/contenttypes"
import { useSpaces } from "@/networking/hooks/spaces"
import { useAppStore } from "@/stores/appStore"
import {
    Box,
    Button,
    Center,
    Container,
    HStack,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Progress,
    Spinner,
    Table,
    Tag,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tooltip,
    Tr,
    VStack,
    useDisclosure,
    useToast
} from "@chakra-ui/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AlertTriangle, Check, Copy, Edit2, Flag, Sliders, Trash2 } from "react-feather"

import { PostAIRequest, PostAIResponse } from "@/app/api/space/[spaceid]/ai/post"
import { GetAITaskItemResponse } from "@/app/api/space/[spaceid]/ai/task/[taskid]/get"
import { PutContentItemRequest, PutContentItemResponse } from "@/app/api/space/[spaceid]/content/[contentid]/put"
import { PutContentTypeItemRequest, PutContentTypeItemResponse } from "@/app/api/space/[spaceid]/contenttype/[contenttypeid]/put"
import { EditorLanguages } from "@/components/ContentEditor/Editor"
import { Empty } from "@/components/Empty"
import TextInput from "@/components/TextInput"
import { getAllLangauges, usePhrases } from "@/lib/lang"
import { apiClient } from "@/networking/ApiClient"
import { useQueryClient } from "@tanstack/react-query"
import CopyToClipboard from "react-copy-to-clipboard"
import { z } from "zod"

interface LanguageData {
    [key: string]: Record<string, any>
}
export default function Home({ params }: { params: { spaceid: string; contentid: string } }) {
    const allLanguages = getAllLangauges()
    const { showMainMenu, hideMainMenu } = useAppStore((state) => state)
    const queryClient = useQueryClient()
    const router = useRouter()
    const toast = useToast()
    const { item: content } = useContentItem(params.spaceid, params.contentid, {})
    const { contenttype } = useContenttype(params.spaceid, content?.content.contentTypeId || "", { disabled: !content })
    const { spaces, isLoading: isSpacesLoading } = useSpaces({})
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isSaveLoading, setIsSaveLoading] = useState<boolean>(false)
    const [language, setLanguage] = useState<SpaceLanguage | "">("")
    const [defaultLanguage, setDefaultLanguage] = useState<SpaceLanguage>("en")
    const [showLanguages, setShowLanguages] = useState<boolean>(false)
    const [published, setPublished] = useState<boolean>(false)
    const [languages, setLanguages] = useState<SpaceLanguage[]>([])
    const [phrases, setPhrases] = useState<{ id: string; description: string; size: "small" | "large" }[]>([])
    const [languageData, setLanguageData] = useState<LanguageData>({})
    const [showPhraseEditor, setShowPhraseEditor] = useState<boolean>(false)
    const [phraseEditorPhraseId, setPhraseEditorPhraseId] = useState<string>("")
    const [phraseEditorDescription, setPhraseEditorDescription] = useState<string>("")
    const [slug, setSlug] = useState<string>("")
    const [phraseEditorSize, setPhraseEditorSize] = useState<string>("")
    const [phraseEditorValues, setPhraseEditorValues] = useState<Record<string, string>>({})
    const [phraseEditorIsNew, setPhraseEditorIsNew] = useState<boolean>(false)
    const [currentLanguageInitialValues, setCurrentLanguageInitialValues] = useState<Record<string, string>>({})
    const [translateAllLoading, setTranslateAllLoading] = useState<boolean>(false)
    const [translateAllTotalAmount, setTranslateAllTotalAmount] = useState<number>(0)
    const [translateAllProgress, setTranslateAllProgress] = useState<number>(0)
    const { isOpen: isDeleteTranslationOpen, onOpen: onDeleteTranslationOpen, onClose: onDeleteTranslationClose } = useDisclosure()
    const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false)

    const { t } = usePhrases();
    useEffect(() => {
        if (!content) return
        if (!contenttype) return
        if (!spaces) return
        setPhrases(
            contenttype.fields
                .filter((f) => f.fieldId !== "__name")
                .map((f) => ({ id: f.fieldId, description: f.description, size: f.dataTypeVariantId === "textbox" ? "small" : "large" }))
        )
        //        setPhrases([{ id: "xxx", description: "y", size: "small" }])

        const space = spaces.find((p) => p.spaceId === params.spaceid)
        if (!space) {
            throw "Space not found"
        }
        setDefaultLanguage(space.defaultLanguage)
        setPublished(content.content.status === "published")

        let langs = [space.defaultLanguage]
        let languageData: LanguageData = {}
        content.contentData.forEach((c) => {
            if (!langs.includes(c.languageId)) langs = [...langs, c.languageId]
            languageData[c.languageId] = c.data
        })
        setLanguages([...langs])
        setLanguageData(languageData)
        const def = content.contentData.find(c => c.languageId === defaultLanguage)
        if (def) {
            setSlug(def.slug || "")
        }


        setIsLoading(false)
    }, [content, contenttype, spaces])

    useEffect(() => {
        hideMainMenu()
        return () => {
            showMainMenu()
        }
    }, [])

    function getTitle() {
        if (!contenttype) return ""
        if (!content) return ""
        if (!spaces) return ""

        const space = spaces.find((s) => s.spaceId === params.spaceid)
        if (!space) return ""

        const titleField = contenttype.fields.find((f) => f.title)
        if (!titleField) return ""

        const lang = content.contentData.find((p) => p.languageId === space.defaultLanguage)
        if (!lang) return ""

        return getTitleMaxLength(lang.data[titleField.fieldId] || "")
    }

    function getTitleMaxLength(title: string) {
        if (title.length > 30) {
            return `${title.substring(0, 27)}...`
        }
        return title
    }

    function startTranslatingPhrases(inital: boolean) {
        setLanguageData((languageData) => {
            if (!language) {
                return languageData
            }

            let phrasesMissingTranslations: Record<string, string> = {}
            let data = languageData[language] || {};
            let defaultData = languageData[defaultLanguage] || {};
            phrases.forEach(p => {
                if (!data[p.id] && defaultData[p.id]) {
                    phrasesMissingTranslations[p.id] = defaultData[p.id]
                }
            })
            if (Object.keys(phrasesMissingTranslations).length === 0) {
                setTranslateAllLoading(false)
                return languageData;
            }
            setTranslateAllLoading(true)
            let translateData: Record<string, string> = {};
            if (inital) {
                setTranslateAllProgress(0);
                setTranslateAllTotalAmount(Object.keys(phrasesMissingTranslations).length)
            } else {
                setTranslateAllTotalAmount((translateAllTotalAmount) => {
                    let prog = (1 - (Object.keys(phrasesMissingTranslations).length / translateAllTotalAmount)) * 100
                    setTranslateAllProgress(prog)
                    return translateAllTotalAmount
                })
            }
            Object.keys(phrasesMissingTranslations).slice(0, 10).forEach(k => {
                translateData[k] = phrasesMissingTranslations[k]
            })

            setCurrentLanguageInitialValues(JSON.parse(JSON.stringify(languageData[language] || {})))
            let task = new AITranslateTask(params.spaceid, (result) => {

                setLanguageData((languageData) => {
                    if (!languageData[language]) {
                        languageData[language] = {}
                    }
                    languageData[language] = { ...languageData[language], ...result }
                    setCurrentLanguageInitialValues(JSON.parse(JSON.stringify(languageData[language] || {})))
                    startTranslatingPhrases(false);
                    return languageData
                })
            })
            task.executeMultiple(translateData, defaultLanguage, language)



            return languageData
        })
    }

    return (
        <>
            {translateAllLoading &&
                <Box position={"fixed"} left={0} right={0} top={0} bottom={0} backgroundColor="rgba(255,255,255,0.75)" zIndex="1000" display={"flex"} alignItems={"center"} justifyContent={"center"}>
                    <VStack spacing={10}>
                        <HStack>
                            <img src="/static/ai.svg" width="64px"></img>
                            <Box fontSize={"32px"} fontWeight={"bold"}>{t("module_translation_edit_translating")}</Box>
                        </HStack>

                        <Progress colorScheme='green' size='sm' value={translateAllProgress} w="500px" />
                    </VStack>
                </Box>
            }


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
                        if (!newLangugaes.find((p) => p === language) && language !== "") {
                            setLanguage(newLangugaes[0])
                        }
                        setShowLanguages(false)
                    }}
                ></EditorLanguages>
            )}

            {showPhraseEditor && (
                <PhraseEditor
                    spaceId={params.spaceid}
                    onClose={() => {
                        setShowPhraseEditor(false)
                    }}
                    onAdd={(phraseId, description, size, values) => {
                        const newPhrases = [...phrases, { id: phraseId, size, description }]
                        setPhrases(newPhrases)

                        let newLanguageData: LanguageData = { ...languageData }
                        Object.keys(values).forEach((k) => {
                            if (!newLanguageData[k]) {
                                newLanguageData[k] = {}
                            }
                            newLanguageData[k][phraseId] = values[k]
                        })

                        setLanguageData(newLanguageData)

                        setCurrentLanguageInitialValues(JSON.parse(JSON.stringify(newLanguageData[language] || {})))

                        setShowPhraseEditor(false)
                    }}
                    onUpdate={(phraseId, description, size, values) => {
                        const newPhrases = [...phrases]
                        const phraseIndex = newPhrases.findIndex((p) => p.id === phraseId)
                        if (phraseIndex > -1) {
                            newPhrases[phraseIndex].size = size
                            newPhrases[phraseIndex].description = description
                        }
                        setPhrases(newPhrases)

                        let newLanguageData: LanguageData = { ...languageData }
                        Object.keys(values).forEach((k) => {
                            if (!newLanguageData[k]) {
                                newLanguageData[k] = {}
                            }
                            newLanguageData[k][phraseId] = values[k]
                        })
                        setLanguageData(newLanguageData)

                        setCurrentLanguageInitialValues(JSON.parse(JSON.stringify(newLanguageData[language] || {})))

                        setShowPhraseEditor(false)
                    }}
                    onDelete={(phraseId: string) => {
                        const newPhrases = [...phrases.filter(p => p.id != phraseId)]
                        let newLanguageData: LanguageData = { ...languageData }
                        for (const lang of Object.keys(newLanguageData)) {
                            if (newLanguageData[lang]) {
                                delete newLanguageData[lang][phraseId]
                            }

                        }
                        setPhrases(newPhrases)
                        setLanguageData(newLanguageData)
                        setCurrentLanguageInitialValues(JSON.parse(JSON.stringify(newLanguageData[language] || {})))
                        setShowPhraseEditor(false)

                    }}
                    isAIEnabled={false}
                    isNew={phraseEditorIsNew}
                    phraseId={phraseEditorPhraseId}
                    size={phraseEditorSize as "small" | "large"}
                    description={phraseEditorDescription}
                    languages={languages}
                    defaultLanguage={defaultLanguage}
                    values={phraseEditorValues}
                    phrases={phrases}
                ></PhraseEditor>
            )}

            {isLoading ? (
                <Center h="100vh" w="100%">
                    <Spinner size="xl" colorScheme="blue"></Spinner>
                </Center>
            ) : (
                content &&
                contenttype && (
                    <>
                        <Modal isOpen={isDeleteTranslationOpen} onClose={onDeleteTranslationClose} isCentered={true}>
                            <ModalOverlay />
                            <ModalContent maxW="500px">
                                <ModalHeader pt={10} px={10} pb={0}>
                                    {t("module_translation_edit_delete_heading")}
                                </ModalHeader>
                                <ModalBody overflow="auto" p={10}>
                                    <Box>
                                        {t("module_translation_edit_delete_description")}
                                    </Box>
                                </ModalBody>

                                <ModalFooter pb={10} px={10} gap={10}>
                                    <Button
                                        isLoading={isDeleteLoading}
                                        colorScheme="red"
                                        mr={3}
                                        minW="150px"
                                        onClick={async () => {
                                            setIsDeleteLoading(true);
                                            try {
                                                await apiClient.delete({
                                                    path: `/space/${params.spaceid}/content/${params.contentid}`,
                                                    isAuthRequired: true,
                                                })

                                                await apiClient.delete({
                                                    path: `/space/${params.spaceid}/contenttype/${contenttype.contentTypeId}`,
                                                    isAuthRequired: true,
                                                })
                                                queryClient.removeQueries([["contenttypes", params.spaceid]])
                                                queryClient.removeQueries([["content", params.spaceid]])
                                                queryClient.removeQueries([["content", params.contentid]])
                                                queryClient.removeQueries([["trash", params.spaceid]])
                                                router.back();
                                                toast({
                                                    title: t("module_translation_edit_delete_success"),
                                                    status: "success",
                                                    position: "bottom-right",
                                                })
                                            } catch (ex) {
                                                setIsDeleteLoading(false)
                                            }


                                        }}
                                    >
                                        {t("module_translation_edit_delete_button")}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            onDeleteTranslationClose()
                                        }}
                                    >
                                        {t("cancel")}
                                    </Button>
                                </ModalFooter>
                            </ModalContent>
                        </Modal>
                        <SaveMenuBar
                            positiveText={t("module_translation_edit_savebar_save")}
                            neutralText={t("module_translation_edit_savebar_close")}
                            positiveLoading={isSaveLoading}
                            onClose={() => {
                                router.push(`/portal/spaces/${params.spaceid}/modules/translation`)
                            }}
                            onNeutral={() => {
                                router.push(`/portal/spaces/${params.spaceid}/modules/translation`)
                            }}
                            onPositive={async () => {
                                setIsSaveLoading(true)

                                const updateContentTypePayload: PutContentTypeItemRequest = {
                                    name: contenttype.name,
                                    enabled: true,
                                    fields: [
                                        {
                                            fieldId: "__name",
                                            dataTypeId: "string",
                                            dataTypeVariantId: "textbox",
                                            name: "Translation name",
                                            description: "",
                                            title: true,
                                            validators: {
                                                required: { enabled: true },
                                                unique: { enabled: false },
                                                minLength: { enabled: false, min: 0 },
                                                maxLength: { enabled: true, max: 4096 },
                                            },
                                            settings: [],
                                            output: false,
                                        },
                                        ...phrases.map((phrase) => {
                                            return {
                                                fieldId: phrase.id,
                                                name: phrase.id,
                                                title: false,
                                                description: phrase.description,
                                                dataTypeId: "string",
                                                dataTypeVariantId: phrase.size === "small" ? "textbox" : "textarea",
                                                validators: {
                                                    required: {
                                                        enabled: false,
                                                    },
                                                    unique: {
                                                        enabled: false,
                                                    },
                                                    maxLength: {
                                                        enabled: false,
                                                        max: 4096,
                                                    },
                                                    minLength: {
                                                        enabled: false,
                                                        min: 0,
                                                    },
                                                },
                                                output: true,
                                                settings: [],
                                            }
                                        }),
                                    ],
                                    generateSlug: true,
                                    hidden: true,
                                }

                                try {
                                    await apiClient.put<PutContentTypeItemResponse, PutContentTypeItemRequest>({
                                        path: `/space/${params.spaceid}/contenttype/${contenttype.contentTypeId}`,
                                        body: updateContentTypePayload,
                                        isAuthRequired: true,
                                    })
                                } catch (ex) {
                                    toast({
                                        title: t("module_translation_edit_save_error_title"),
                                        status: "error",
                                        position: "bottom-right",
                                    })
                                    setIsSaveLoading(false)
                                    return
                                }

                                let body: PutContentItemRequest = {
                                    status: published ? "published" : "draft",
                                    data: languages.map((lang) => {
                                        let data: Record<string, string> = languageData[lang] ?? {}
                                        if (!data.__name) {
                                            data.__name = getTitle()
                                        }
                                        return {
                                            languageId: lang,
                                            data,
                                            //slug: item.slug,
                                        }
                                    }),
                                }
                                try {
                                    const content = await apiClient.put<PutContentItemResponse, PutContentItemRequest>({
                                        path: `/space/${params.spaceid}/content/${params.contentid}`,
                                        isAuthRequired: true,
                                        body,
                                    })
                                } catch (ex) {
                                    toast({
                                        title: t("module_translation_edit_save_error_title"),
                                        status: "error",
                                        position: "bottom-right",
                                    })
                                    setIsSaveLoading(false)
                                    return
                                }
                                setIsSaveLoading(false)
                                queryClient.invalidateQueries([["content", params.spaceid]])
                                queryClient.invalidateQueries([["content", params.contentid]])
                                queryClient.removeQueries([["contenttype", params.spaceid, contenttype.contentTypeId]])
                                queryClient.removeQueries([["contenttypes", params.spaceid]])

                                setCurrentLanguageInitialValues(JSON.parse(JSON.stringify(languageData[language] || {})))

                                toast({
                                    title: t("module_translation_edit_save_success", getTitle()),
                                    status: "success",
                                    position: "bottom-right",
                                })

                                setIsSaveLoading(false)

                                //await save()
                            }}
                        >
                            <HStack spacing={2}>
                                <Box as="span">{t("module_translation_edit_heading")}</Box>
                                <Box as="span" fontWeight={"bold"}>
                                    {getTitle()}
                                </Box>
                            </HStack>
                        </SaveMenuBar>

                        <Box backgroundColor={"#fff"} minH={"100vh"} pt="120px" pb={"50px"}>
                            <Container maxW="1400px">
                                <HStack w="100%" alignItems={"flex-start"} spacing={"20"}>
                                    <VStack w="250px" spacing={"20"} alignItems={"flex-start"}>
                                        <Box>
                                            <VStack w="100%" alignItems={"flex-start"}>
                                                <HStack>
                                                    <Box fontWeight="bold">{t("module_translation_edit_published")}</Box>
                                                </HStack>
                                                <VStack spacing={5} w="100%" alignItems={"flex-start"}>
                                                    <Box>
                                                        <CheckboxInput
                                                            checked={published}
                                                            onChange={setPublished}
                                                            uncheckedBody={<Box>{t("module_translation_edit_published_isdraft")}</Box>}
                                                            checkedBody={<Box>{t("module_translation_edit_published_ispublished")}</Box>}
                                                        ></CheckboxInput>
                                                    </Box>
                                                </VStack>
                                            </VStack>
                                        </Box>

                                        <SelectionList
                                            subject={t("module_translation_edit_languages")}
                                            items={languages.map((l) => {
                                                return {
                                                    id: l,
                                                    name: getLanguageTitle(l, allLanguages),
                                                }
                                            })}
                                            onSettings={() => setShowLanguages(true)}
                                            settingsIcon={<Sliders></Sliders>}
                                            selectedItemId={language}
                                            settingsTooltip={t("module_translation_edit_languages_tooltip")}
                                            onClick={(lang) => {
                                                setCurrentLanguageInitialValues(JSON.parse(JSON.stringify(languageData[lang] || {})))
                                                setLanguage(lang as SpaceLanguage)
                                            }}
                                            anyText="Overview"
                                        ></SelectionList>

                                        <Box>
                                            <VStack w="100%" alignItems={"flex-start"}>
                                                <Box fontWeight="bold">contentId</Box>
                                                <HStack>
                                                    <TextInput value={params.contentid} disabled={true}  ></TextInput>
                                                    <CopyToClipboard
                                                        text={params.contentid}
                                                        onCopy={() =>
                                                            toast({
                                                                title: t("module_translation_edit_copied", "contentId"),
                                                                status: "info",
                                                                position: "bottom-right",
                                                            })
                                                        }
                                                    >
                                                        <Button variant={"ghost"} w="60px">
                                                            <Copy></Copy>
                                                        </Button>
                                                    </CopyToClipboard>
                                                </HStack>

                                            </VStack>
                                        </Box>

                                        {slug && <Box>
                                            <VStack w="100%" alignItems={"flex-start"}>
                                                <Box fontWeight="bold">slug</Box>
                                                <HStack>
                                                    <TextInput value={slug} disabled={true}  ></TextInput>
                                                    <CopyToClipboard
                                                        text={slug}
                                                        onCopy={() =>
                                                            toast({
                                                                title: "slug copied",
                                                                status: "info",
                                                                position: "bottom-right",
                                                            })
                                                        }
                                                    >
                                                        <Button variant={"ghost"} w="60px">
                                                            <Copy></Copy>
                                                        </Button>
                                                    </CopyToClipboard>
                                                </HStack>

                                            </VStack>
                                        </Box>
                                        }


                                        <Box>
                                            <VStack w="100%" alignItems={"flex-start"}>
                                                <Box fontWeight="bold">{t("module_translation_edit_details_delete_subject")}</Box>
                                                <Button onClick={onDeleteTranslationOpen}>{t("module_translation_edit_details_delete_button")}</Button>
                                            </VStack>
                                        </Box>


                                    </VStack>
                                    <VStack spacing={"10"} alignItems={"flex-start"} flex={1}>
                                        <HStack>
                                            <Button
                                                onClick={() => {
                                                    setPhraseEditorPhraseId("")
                                                    setPhraseEditorDescription("")
                                                    setPhraseEditorSize("small")
                                                    setPhraseEditorValues({})
                                                    setPhraseEditorIsNew(true)
                                                    setShowPhraseEditor(true)
                                                }}
                                            >
                                                {t("module_translation_edit_addphrase")}
                                            </Button>
                                            {language !== "" && language !== defaultLanguage && <Button
                                                isLoading={translateAllLoading}
                                                isDisabled={translateAllLoading}
                                                onClick={() => {
                                                    startTranslatingPhrases(true)
                                                }}
                                            >
                                                {t("module_translation_edit_translateall")}
                                            </Button>
                                            }
                                        </HStack>

                                        {language === "" &&
                                            (phrases.length === 0 ? (
                                                <Empty message={t("module_translation_edit_nophrases")}></Empty>
                                            ) : (
                                                <Table w="100%">
                                                    <Thead>
                                                        <Tr>
                                                            <Th>{t("module_translation_edit_list_heading_phrase")}</Th>
                                                            {languages.map((lang) => (
                                                                <Th key={lang} w="40px">
                                                                    {lang}
                                                                </Th>
                                                            ))}
                                                            <Th></Th>
                                                        </Tr>
                                                    </Thead>

                                                    <Tbody>
                                                        {phrases.map((p) => (
                                                            <Tr key={p.id}>
                                                                <Td>
                                                                    <Box>{p.id}</Box>
                                                                    {p.description && (
                                                                        <Box fontSize={"xs"} color="gray.500">
                                                                            {p.description}
                                                                        </Box>
                                                                    )}
                                                                </Td>
                                                                {languages.map((lang) => (
                                                                    <Td key={lang} w="40px">
                                                                        {languageData[lang] ? (
                                                                            languageData[lang][p.id] ? (
                                                                                <Tooltip label={languageData[lang][p.id]}>
                                                                                    <Check color="#689783"></Check>
                                                                                </Tooltip>
                                                                            ) : (
                                                                                <Tooltip label={t("module_translation_edit_list_translatingmissing")}>
                                                                                    <AlertTriangle color="#946B6D"></AlertTriangle>
                                                                                </Tooltip>
                                                                            )
                                                                        ) : (
                                                                            <Tooltip label={t("module_translation_edit_list_translatingmissing")}>
                                                                                <AlertTriangle color="#946B6D"></AlertTriangle>
                                                                            </Tooltip>
                                                                        )}
                                                                    </Td>
                                                                ))}
                                                                <Td w="40px">
                                                                    <Button
                                                                        variant={"ghost"}
                                                                        onClick={() => {
                                                                            let values: Record<string, string> = {}
                                                                            languages.forEach((lang) => {
                                                                                if (languageData[lang]) {
                                                                                    values[lang] = languageData[lang][p.id] ?? ""
                                                                                }
                                                                                setPhraseEditorValues(values)
                                                                            })

                                                                            setPhraseEditorPhraseId(p.id)
                                                                            setPhraseEditorDescription(p.description)
                                                                            setPhraseEditorSize(p.size)
                                                                            setPhraseEditorIsNew(false)
                                                                            setShowPhraseEditor(true)
                                                                        }}
                                                                    >
                                                                        <Edit2></Edit2>
                                                                    </Button>
                                                                </Td>
                                                            </Tr>
                                                        ))}
                                                    </Tbody>
                                                </Table>
                                            ))}

                                        {language !== "" &&
                                            (phrases.length === 0 ? (
                                                <Empty message={t("module_translation_edit_nophrases")}></Empty>
                                            ) : (
                                                <Table w="100%">
                                                    <Thead>
                                                        <Tr>
                                                            <Th>Phrase</Th>

                                                            {defaultLanguage !== language && <Th>{getLanguageTitle(language, allLanguages)}</Th>}

                                                            <Th></Th>
                                                        </Tr>
                                                    </Thead>

                                                    <Tbody>
                                                        {phrases.map((p) => (
                                                            <Tr key={p.id}>
                                                                <Td w="40%">
                                                                    <Box>{p.id}</Box>
                                                                    {p.description && (
                                                                        <Box fontSize={"xs"} color="gray.500">
                                                                            {p.description}
                                                                        </Box>
                                                                    )}
                                                                    {defaultLanguage !== language && (
                                                                        <Box mt="3" fontSize={"xs"}>
                                                                            <Tag mr={3}>{defaultLanguage} </Tag>
                                                                            {(languageData[defaultLanguage] ?? {})[p.id]}
                                                                        </Box>
                                                                    )}
                                                                </Td>

                                                                <Td>
                                                                    <TextInput
                                                                        value={currentLanguageInitialValues[p.id] || ""}
                                                                        type={p.size === "small" ? "text" : "textarea"}
                                                                        onChange={(value) => {
                                                                            let newLanguageData: LanguageData = { ...languageData }
                                                                            if (!newLanguageData[language]) {
                                                                                newLanguageData[language] = {}
                                                                            }
                                                                            newLanguageData[language][p.id] = value
                                                                            setLanguageData(newLanguageData)
                                                                        }}
                                                                    ></TextInput>
                                                                </Td>
                                                                <Td w="40px">
                                                                    <HStack spacing={5}>
                                                                        {defaultLanguage !== language && (
                                                                            <SingleTranslationButton
                                                                                spaceId={params.spaceid}
                                                                                fromLanguage={defaultLanguage}
                                                                                toLanguage={language}
                                                                                value={languageData[defaultLanguage][p.id]}
                                                                                onUpdate={(value: string) => {
                                                                                    setLanguageData((languageData) => {
                                                                                        let newLanguageData: LanguageData = { ...languageData }
                                                                                        if (!newLanguageData[language]) {
                                                                                            newLanguageData[language] = {}
                                                                                        }
                                                                                        newLanguageData[language][p.id] = value
                                                                                        setCurrentLanguageInitialValues(JSON.parse(JSON.stringify(newLanguageData[language] || {})))
                                                                                        return newLanguageData
                                                                                    })
                                                                                }}
                                                                                onClick={() => {
                                                                                    setCurrentLanguageInitialValues(JSON.parse(JSON.stringify(languageData[language] || {})))
                                                                                }}
                                                                            ></SingleTranslationButton>
                                                                        )}

                                                                        <Button
                                                                            variant={"ghost"}
                                                                            onClick={() => {
                                                                                let values: Record<string, string> = {}
                                                                                languages.forEach((lang) => {
                                                                                    if (languageData[lang]) {
                                                                                        values[lang] = languageData[lang][p.id] ?? ""
                                                                                    }
                                                                                    setPhraseEditorValues(values)
                                                                                })

                                                                                setPhraseEditorPhraseId(p.id)
                                                                                setPhraseEditorDescription(p.description)
                                                                                setPhraseEditorSize(p.size)
                                                                                setPhraseEditorIsNew(false)
                                                                                setShowPhraseEditor(true)
                                                                            }}
                                                                        >
                                                                            <Edit2></Edit2>
                                                                        </Button>
                                                                    </HStack>
                                                                </Td>
                                                            </Tr>
                                                        ))}
                                                    </Tbody>
                                                </Table>
                                            ))}
                                    </VStack>
                                </HStack>
                            </Container>
                        </Box>
                    </>
                )
            )}
        </>
    )
}

function PhraseEditor({
    onClose,
    onAdd,
    onUpdate,
    onDelete,
    isAIEnabled,
    isNew,
    phraseId: initialPhraseId,
    size: initialSize,
    languages,
    defaultLanguage,
    values: initialValues,
    description: intialDescription,
    phrases,
    spaceId,
}: {
    onClose: () => void
    onUpdate: (phraseId: string, description: string, size: "small" | "large", values: Record<string, string>) => void
    onAdd: (phraseId: string, description: string, size: "small" | "large", values: Record<string, string>) => void
    onDelete: (phraseId: string) => void
    isAIEnabled: boolean
    isNew: boolean
    phraseId: string
    description: string
    size: "small" | "large"
    languages: SpaceLanguage[]
    defaultLanguage: SpaceLanguage
    values: Record<string, string>
    phrases: { id: string; description: string; size: "small" | "large" }[]
    spaceId: string
}) {

    const [phraseId, setPhraseId] = useState<string>(initialPhraseId)
    const [phraseIdValid, setPhraseIdValid] = useState<boolean>(phraseId !== "")
    const [size, setSize] = useState<string>(initialSize)
    const [description, setDescription] = useState<string>(intialDescription)

    const [values, setValues] = useState<Record<string, string>>(initialValues)
    const [languageTriggerDates, setLanguageTriggerDates] = useState<Record<string, Date>>({});

    const { isOpen: isWarningOpen, onOpen: onWarningOpen, onClose: onWarningClose } = useDisclosure()
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()

    const { t } = usePhrases();
    function updateValue(language: string, value: string) {
        setValues((values) => {
            values[language] = value
            return { ...values }
        })
    }
    const allLanguages = getAllLangauges();


    useEffect(() => {
        setPhraseId(initialPhraseId)
    }, [initialPhraseId])
    useEffect(() => {
        setSize(initialSize)
    }, [initialSize])
    useEffect(() => {
        setDescription(intialDescription)
    }, [intialDescription])
    useEffect(() => {
        setValues(initialValues)
    }, [initialValues])

    return (
        <>
            <Modal isOpen={isWarningOpen} onClose={onWarningClose} isCentered={true}>
                <ModalOverlay />
                <ModalContent maxW="500px">
                    <ModalHeader pt={10} px={10} pb={0}>
                        {t("module_translation_edit_warning")}
                    </ModalHeader>
                    <ModalBody overflow="auto" p={10}>
                        <VStack w="100%" alignItems={"flex-start"}>
                            <Box>
                                {t("module_translation_edit_warning_description_part1")}{" "}
                                <Text as="span" fontWeight={"bold"}>
                                    {generateNewPhraseId(phraseId)}
                                </Text>{" "}
                                {t("module_translation_edit_warning_description_part2")}
                            </Box>
                            <Box>{t("module_translation_edit_warning_description2")}</Box>
                        </VStack>
                    </ModalBody>

                    <ModalFooter pb={10} px={10} gap={10}>
                        <Button
                            colorScheme="blue"
                            mr={3}
                            minW="150px"
                            onClick={() => {
                                onWarningClose()
                            }}
                        >
                            {t("module_translation_edit_warning_button")}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered={true}>
                <ModalOverlay />
                <ModalContent maxW="500px">
                    <ModalHeader pt={10} px={10} pb={0}>
                        {t("module_translation_edit_deletephrase_heading")}
                    </ModalHeader>
                    <ModalBody overflow="auto" p={10}>
                        <Box>
                            {t("module_translation_edit_deletephrase_question")} <Text as="span" fontWeight={"bold"}>{phraseId}</Text>?
                        </Box>
                    </ModalBody>

                    <ModalFooter pb={10} px={10} gap={10}>
                        <Button
                            colorScheme="red"
                            mr={3}
                            minW="150px"
                            onClick={async () => {
                                onDelete(phraseId)
                            }}
                        >
                            {t("module_translation_edit_deletephrase_button")}
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



            <Modal
                isOpen={true}
                onClose={() => {
                    setPhraseId("")
                    setSize("small")
                    setDescription("")
                    setValues({})

                    onClose()
                }}
                isCentered={true}
            >
                <ModalOverlay />
                <ModalContent maxW="800px" maxH="80%">
                    <ModalHeader pt={10} px={10} pb={0}>
                        <HStack>
                            <Box flex={1}>{isNew ? t("module_translation_edit_phrase_addphrase") : t("module_translation_edit_phrase_editphrase", phraseId)}</Box>
                            {!isNew && (
                                <Button variant={"ghost"} color="red.600" onClick={onDeleteOpen}>
                                    <Trash2></Trash2>
                                </Button>
                            )}
                        </HStack>
                    </ModalHeader>
                    <ModalBody minH="200px" maxH="90vh" overflow="auto" p={10}>
                        <VStack spacing="10" alignItems={"flex-start"}>
                            <HStack alignItems={"flex-start"} w="100%" spacing="20">
                                <Box w="60%">
                                    <TextInput
                                        disabled={!isNew}
                                        value={phraseId}
                                        onChange={setPhraseId}
                                        subject="phraseId"
                                        validate={z.string().min(1)}
                                        onValidation={(valid) => {
                                            setPhraseIdValid(valid)
                                        }}
                                    ></TextInput>
                                </Box>
                                <Box w="40%">
                                    <TextInput
                                        value={size}
                                        onChange={setSize}
                                        subject={t("module_translation_edit_phrase_size")}
                                        type="select"
                                        options={[
                                            { key: "small", text: "small" },
                                            { key: "large", text: "large" },
                                        ]}
                                    ></TextInput>
                                </Box>
                            </HStack>

                            <Box w="100%">
                                <TextInput value={description} onChange={setDescription} subject={t("module_translation_edit_phrase_description")}></TextInput>
                            </Box>
                            <TextInput
                                type={size === "small" ? "text" : "textarea"}
                                value={values[defaultLanguage] ?? ""}
                                onChange={(value) => {
                                    updateValue(defaultLanguage, value)
                                }}
                                subject={getLanguageTitle(defaultLanguage, allLanguages)}
                            ></TextInput>
                            {languages.length > 0 && (
                                <Box>
                                    <Button leftIcon={<Flag></Flag>} h={"40px"} fontSize="12px" onClick={() => {

                                        const triggers: Record<string, Date> = {}

                                        let langs = languages.filter((l) => l !== defaultLanguage).filter(l => !values[l])
                                        console.log(langs)
                                        langs.forEach(lang => {
                                            triggers[lang] = new Date();
                                        })
                                        console.log(triggers)
                                        setLanguageTriggerDates(triggers)


                                    }}>
                                        {t("module_translation_edit_phrase_translatetoall")}
                                    </Button>
                                </Box>
                            )}
                            {languages
                                .filter((l) => l !== defaultLanguage)
                                .map((lang) => (
                                    <HStack w="100%" key={lang}>
                                        <Box flex={1}>
                                            <TextInput
                                                type={size === "small" ? "text" : "textarea"}
                                                value={values[lang] ?? ""}
                                                onChange={(value) => {
                                                    updateValue(lang, value)
                                                }}
                                                subject={getLanguageTitle(lang, allLanguages)}
                                            ></TextInput>
                                        </Box>
                                        <Box mt={7}>
                                            <SingleTranslationButton
                                                spaceId={spaceId}
                                                fromLanguage={defaultLanguage}
                                                toLanguage={lang}
                                                triggerDate={languageTriggerDates[lang]}
                                                value={values[defaultLanguage] ?? ""}
                                                onUpdate={(value: string) => {
                                                    updateValue(lang, value)
                                                }}
                                            ></SingleTranslationButton>
                                        </Box>
                                    </HStack>
                                ))}
                        </VStack>
                    </ModalBody>

                    <ModalFooter pb={10} px={10} gap={10}>
                        <Button
                            colorScheme="green"
                            mr={3}
                            minW="150px"
                            isDisabled={!phraseIdValid}
                            onClick={() => {
                                let newPhraseId = generateNewPhraseId(phraseId)
                                if (isNew) {
                                    if (phrases.find((p) => p.id === newPhraseId)) {
                                        onWarningOpen()
                                        return
                                    }
                                    onAdd(newPhraseId, description, size as "small" | "large", values)
                                    setPhraseId("")
                                    setSize("small")
                                    setDescription("")
                                    setValues({})
                                } else {
                                    onUpdate(phraseId, description, size as "small" | "large", values)
                                    setPhraseId("")
                                    setSize("small")
                                    setDescription("")
                                    setValues({})
                                }
                            }}
                        >
                            {isNew ? t("module_translation_edit_phrase_button_add") : t("module_translation_edit_phrase_button_update")}
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
        </>
    )
}

function SingleTranslationButton({
    spaceId,
    fromLanguage,
    toLanguage,
    value,
    onUpdate,
    onClick,
    triggerDate,
}: {
    spaceId: string
    fromLanguage: SpaceLanguage
    toLanguage: SpaceLanguage
    value: string
    onUpdate: (value: string) => void
    onClick?: () => void
    triggerDate?: Date
}) {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const { t } = usePhrases();
    useEffect(() => {
        if (!triggerDate) return;
        let task = new AITranslateTask(spaceId, (result) => {
            setIsLoading(false)
            if (result) onUpdate(result)
        })
        task.execute(value, fromLanguage, toLanguage)
        setIsLoading(true)

    }, [triggerDate])
    return (
        <Tooltip label={t("module_translation_edit_singletranslation_tooltip", getLanguageName(fromLanguage), getLanguageName(toLanguage))}>
            <Button
                isLoading={isLoading}
                variant={"ghost"}
                onClick={() => {
                    onClick && onClick()
                    let task = new AITranslateTask(spaceId, (result) => {
                        setIsLoading(false)
                        if (result) onUpdate(result)
                    })
                    task.execute(value, fromLanguage, toLanguage)
                    setIsLoading(true)
                }}
            >
                <Flag></Flag>
            </Button>
        </Tooltip>
    )
}

function getLanguageTitle(language: string, allLanguages: any[]) {
    //@ts-ignore
    const lang = allLanguages.find((al) => al.code === language)
    if (!lang) return "N/A"

    return `${lang.name} (${lang.code})`
    return "aa"
}

function getLanguageName(language: string) {
    const allLanguages = getAllLangauges();
    const lang = allLanguages.find((al) => al.code === language)
    if (!lang) return "N/A"

    return lang.name
}

const generateNewPhraseId = (str: string) =>
    str
        .trim()
        .replace(/[^\w\s-.]/g, "")
        .replace(/[\s_-]+/g, "_")
        .replace(/^-+|-+$/g, "")

class AITranslateTask {
    callback: (result: any) => void
    spaceId: string
    taskId: string = ""
    interval: NodeJS.Timer | undefined = undefined

    constructor(spaceId: string, callback: (result: any) => void) {
        this.callback = callback
        this.spaceId = spaceId
    }

    async execute(value: string, fromLanguage: SpaceLanguage, toLanguage: SpaceLanguage) {
        const body: PostAIRequest = {
            module: "translate",
            data: {
                data: {
                    text: value,
                },
            },
            languages: {
                from: fromLanguage,
                to: toLanguage,
            },
            details: {},
        }
        try {
            const response = await apiClient.post<PostAIResponse, PostAIRequest>({
                path: `/space/${this.spaceId}/ai`,
                isAuthRequired: true,
                body,
            })
            this.taskId = response.taskId
            let that = this
            this.interval = setInterval(async function () {
                try {
                    const response = await apiClient.get<GetAITaskItemResponse>({
                        path: `/space/${that.spaceId}/ai/task/${that.taskId}`,
                        isAuthRequired: true,
                    })
                    if (response.state === "done") {
                        that.callback(response.result?.data?.text || "")
                        clearInterval(that.interval)
                    }
                    if (response.state === "error") {
                        that.callback("")
                        clearInterval(that.interval)
                    }
                } catch (ex) { }
            }, 2000)
        } catch (ex) { }
    }

    async executeMultiple(value: Record<string, string>, fromLanguage: SpaceLanguage, toLanguage: SpaceLanguage) {
        const body: PostAIRequest = {
            module: "translate",
            data: {
                data: value,
            },
            languages: {
                from: fromLanguage,
                to: toLanguage,
            },
            details: {},
        }
        try {
            const response = await apiClient.post<PostAIResponse, PostAIRequest>({
                path: `/space/${this.spaceId}/ai`,
                isAuthRequired: true,
                body,
            })
            this.taskId = response.taskId
            let that = this
            this.interval = setInterval(async function () {
                try {
                    const response = await apiClient.get<GetAITaskItemResponse>({
                        path: `/space/${that.spaceId}/ai/task/${that.taskId}`,
                        isAuthRequired: true,
                    })
                    if (response.state === "done") {
                        that.callback(response.result?.data || {})
                        clearInterval(that.interval)
                    }
                    if (response.state === "error") {
                        that.callback({})
                        clearInterval(that.interval)
                    }
                } catch (ex) { }
            }, 2000)
        } catch (ex) { }
    }

}
