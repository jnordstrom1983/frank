import { PostAIRequest, PostAIResponse } from "@/app/api/space/[spaceid]/ai/post"
import TextInput from "@/components/TextInput"
import { dataTypes } from "@/lib/constants"
import { ContentData } from "@/models/contentdata"
import { ContentType } from "@/models/contentype"
import { SpaceLanguage } from "@/models/space"
import { apiClient } from "@/networking/ApiClient"
import { useSpaces } from "@/networking/hooks/spaces"
import { Box, Button, Flex, HStack, VStack, space, useToast } from "@chakra-ui/react"
import { ReactElement, useEffect, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { AIState } from "./AI"
import { usePhrases } from "@/lib/lang"

export function AIReprahse({
    datas,
    language,
    spaceId,
    contentType,
    setTaskDescription,
    setTaskTitle,
    state,
    setState,
    onClose,
    setReady,
    setTaskId,
    updateDatas,
    result,
}: {
    datas: ContentData[]
    language: SpaceLanguage
    contentType: ContentType
    spaceId: string
    setTaskDescription: (el: ReactElement) => void
    setTaskTitle: (title: string) => void
    state: AIState
    setState: (state: AIState) => void
    onClose: () => void
    setReady: (ready: boolean) => void
    setTaskId: (taskId: string) => void
    updateDatas: (datas: ContentData[]) => void
    result?: Record<string, any>
}) {
    const { spaces, isLoading: isSpacesLoading } = useSpaces({})
    const toast = useToast()
    useEffect(() => {
        setTaskTitle(t("ai_rephrase_title_field"))
        setReady(false)
    }, [])

    const [newPhrse, setNewPhrase] = useState<string>("")
    const [oldPhrase, setOldPhrase] = useState<string>("")
    const [field, setField] = useState<string>("")
    const [input, setInput] = useState<string>("free")
    const { t } = usePhrases();

    useEffect(() => {
        setState("prepare")
    }, [spaces])

    useEffect(() => {
        if (!result) return

        const updated = result[field]
        setNewPhrase(updated)
    }, [result])

    useEffect(() => {
        if (!field) {
            setTaskDescription(
                <Flex gap={1} flexWrap={"wrap"}>
                    <Box as="span">{t("ai_rephrase_title_nofield")}</Box>
                </Flex>
            )
            setReady(false)
            return
        }

        setTaskDescription(
            <Flex gap={1} flexWrap={"wrap"}>
                <Box as="span">{t("ai_rephrase_title_field")}</Box>
                <Box as="span" fontWeight={"bold"}>
                    {field}
                </Box>
                <Box as="span">{t("ai_rephrase_title_field_to")}</Box>
                <Box as="span" fontWeight={"bold"}>
                    {input === "free" && t("ai_rephrase_title_field_free")}

                    {input === "context" && t("ai_rephrase_title_field_context")}
                    {input === "positive" && t("ai_rephrase_title_field_positive")}
                    {input === "formal" && t("ai_rephrase_title_field_formal")}
                </Box>
            </Flex>
        )
        setReady(true)
    }, [field, input])

    useEffect(() => {
        if (state === "processing") {
            ; (async () => {
                const data: Record<string, any> = {}
                const currentData: Record<string, any> = datas.find((p) => p.languageId === language)?.data || {}
                data[field] = currentData[field]

                setOldPhrase(currentData[field])

                const body: PostAIRequest = {
                    module: "reprahse",
                    data: data,
                    languages: {
                        from: language,
                    },
                    details: {
                        input,
                        allData : currentData
                    },
                }
                try {
                    const response = await apiClient.post<PostAIResponse, PostAIRequest>({
                        path: `/space/${spaceId}/ai`,
                        isAuthRequired: true,
                        body,
                    })

                    setTaskId(response.taskId)
                } catch (ex) {
                    toast({
                        title: t("ai_reprhase_start_error"),
                        status: "error",
                        position: "bottom-right",
                    })

                    setState("prepare")
                }
            })()
        }
    }, [state])
    if (state === "prepare") {
        return (
            <Box my={10} w="100%">
                <HStack w="100%" spacing={10} alignItems={"flex-start"}>
                    <Box w="45%">
                        <TextInput
                            value={field}
                            onChange={setField}
                            placeholder={t("ai_reprhase_prepare_field_placeholder")}
                            options={contentType.fields
                                ?.filter((f) => {
                                    const type = dataTypes.find((p) => p.id === f.dataTypeId)
                                    if (!type) return false
                                    const variant = type.variants.find((v) => v.id === f.dataTypeVariantId)
                                    if (!variant) return false
                                    if (variant.ai.translate) return true
                                    return false
                                })
                                .map((f) => ({
                                    key: f.fieldId,
                                    text: f.name,
                                }))}
                            type="select"
                            subject={t("ai_reprhase_prepare_field_subject")}
                        ></TextInput>
                    </Box>

                    <TagSelect
                        value={input}
                        subject={t("ai_reprhase_prepare_field_to")}
                        onChange={setInput}
                        options={[
                            { key: "free", text: t("ai_rephrase_title_field_free") },
                            { key: "context", text: t("ai_rephrase_title_field_context") },
                            { key: "positive", text: t("ai_rephrase_title_field_positive") },
                            { key: "formal", text: t("ai_rephrase_title_field_formal") },
                        ]}
                    ></TagSelect>
                </HStack>
            </Box>
        )
    }

    if (state === "done") {
        return (
            <VStack w="100%" alignItems={"flex-start"} spacing={5}>
                <HStack w="100%">
                    <Box w="40%">{t("ai_reprhase_old_value")}</Box>
                    <Box w="60%" bgColor="#e8d8d8" borderRadius="3px" p={3}>
                        {oldPhrase}
                    </Box>
                </HStack>

                <HStack w="100%">
                    <Box w="40%">{t("ai_reprhase_new_value")}</Box>
                    <Box w="60%" bgColor="#e3f1e3" borderRadius="3px" p={3}>
                        {newPhrse}
                    </Box>
                </HStack>

                <Box backgroundColor="#F8F8F8" borderRadius="15px" padding={10} w="100%">
                    <HStack spacing={5} width="100%">
                        <VStack flex={1} alignItems={"flex-start"}>
                            <Box fontSize="20px">{t("ai_reprhase_accept")}</Box>
                        </VStack>
                        <Button
                            colorScheme="blue"
                            onClick={() => {
                                setState("prepare")
                            }}
                        >
                            {t("ai_reprhase_cancel")}
                        </Button>

                        <Button
                            colorScheme="green"
                            onClick={() => {
                                const updatedDatas = [...datas]
                                let index = updatedDatas.findIndex((p) => p.languageId === language)
                                if (index === -1) {
                                    const dataItem: ContentData = {
                                        contentDataId: uuidv4(),
                                        contentTypeId: contentType.contentTypeId,
                                        spaceId: spaceId,
                                        contentId: "",
                                        languageId: language,
                                        modifiedUserId: "",
                                        modifiedDate: new Date(),
                                        data: {},
                                        status: "published"
                                    }
                                    updatedDatas.push(dataItem)

                                    index = updatedDatas.findIndex((p) => p.languageId === language)
                                }

                                if (index !== -1) {
                                    updatedDatas[index].data[field] = newPhrse
                                    updateDatas(updatedDatas)
                                    onClose()
                                }

                                onClose()
                            }}
                        >
                            {t("ai_reprhase_save")}
                        </Button>
                    </HStack>
                </Box>
            </VStack>
        )
    }
    return null
}

function TagSelect({ subject, value, onChange, options }: { subject?: string; value: string; onChange?: (value: string) => void; options: { key: string; text: string }[] }) {
    const [internalValue, setInternalValue] = useState<string>(value)

    useEffect(() => {
        setInternalValue(value)
    }, [value])

    return (
        <VStack w="100%" alignItems={"flex-start"}>
            {subject && <Box>{subject}</Box>}

            <Flex flexWrap={"wrap"} gap={5} w="100%" alignItems={"flex-start"}>
                {options.map((o) => {
                    if (o.key === internalValue) {
                        return (
                            <Button
                                key={o.key}
                                variant={"ghost"}
                                fontSize={"14px"}
                                height="38px"
                                backgroundColor="blue.500"
                                px={5}
                                borderRadius="25px"
                                minW="100px"
                                cursor={"pointer"}
                                textAlign={"center"}
                                _hover={{ opacity: 0.8 }}
                                color="#fff"
                            >
                                {o.text}
                            </Button>
                        )
                    } else {
                        return (
                            <Button
                                key={o.key}
                                variant={"ghost"}
                                px={5}
                                height="38px"
                                fontSize={"14px"}
                                _hover={{ opacity: 0.8 }}
                                minW="100px"
                                cursor={"pointer"}
                                textAlign={"center"}
                                onClick={() => {
                                    setInternalValue(o.key)
                                    onChange && onChange(o.key)
                                }}
                            >
                                {o.text}
                            </Button>
                        )
                    }
                })}
            </Flex>
        </VStack>
    )
}
