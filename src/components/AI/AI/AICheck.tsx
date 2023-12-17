import { PostAIRequest, PostAIResponse } from "@/app/api/space/[spaceid]/ai/post"
import { dataTypes } from "@/lib/constants"
import { ContentData } from "@/models/contentdata"
import { ContentType } from "@/models/contentype"
import { SpaceLanguage } from "@/models/space"
import { apiClient } from "@/networking/ApiClient"
import { Box, Flex, Table, Tbody, Td, Th, Thead, Tr, VStack, useToast } from "@chakra-ui/react"
import { ReactElement, useEffect, useState } from "react"
import { CheckboxInput } from "../../CheckboxInput"
import { SimpleCheckboxInput } from "../../SimpleCheckbox"
import { AIState } from "./AI"
import { usePhrases } from "@/lib/lang"

export function AICheck({
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
    const toast = useToast()
    const { t } = usePhrases();

    useEffect(() => {
        setTaskTitle(t("ai_check_title"))
    }, [])

    const [allFields, setAllFields] = useState<boolean>(true)
    const [fields, setFields] = useState<string[]>([])

    useEffect(() => {
        setState("prepare")
    }, [])

    useEffect(() => {
        if (!result) return
        const updatedDatas = [...datas]
        const index = updatedDatas.findIndex((p) => p.languageId === language)
        if (index !== -1) {
            const keys = Object.keys(result)
            keys.forEach((key) => {
                updatedDatas[index].data[key] = result[key]
            })
            updateDatas(updatedDatas)
            onClose()
        }
    }, [result])

    useEffect(() => {
        if (allFields) {
            setTaskDescription(
                <Flex gap={1} flexWrap={"wrap"}>
                    <Box as="span">{t("ai_check_allfields_description_check")} </Box>
                    <Box as="span" fontWeight={"bold"}>
                        {t("ai_check_allfields_ddescription_all")}
                    </Box>
                    <Box as="span">{t("ai_check_dallfields_description_text")}</Box>
                </Flex>
            )
            setReady(true)
        } else {
            if (fields.length === 0) {
                setTaskDescription(<Box>{t("ai_check_select_description")}</Box>)
                setReady(false)
            } else {
                setTaskDescription(
                    <Flex gap={1} flexWrap={"wrap"}>
                        <Box as="span">{t("ai_check_allfields_description_check")} </Box>
                        <Box fontWeight={"bold"}>
                            {fields
                                .map((f) => {
                                    return f
                                })
                                .join(", ")}
                        </Box>
                        <Box as="span">{t("ai_check_select_description_text")}</Box>
                    </Flex>
                )
                setReady(true)
            }
        }
    }, [allFields, fields])

    useEffect(() => {
        if (state === "processing") {
            ;(async () => {
                const data: Record<string, any> = {}
                const currentData: Record<string, any> = datas.find((p) => p.languageId === language)?.data || {}

                if (allFields) {
                    contentType.fields
                        ?.filter((f) => {
                            const type = dataTypes.find((p) => p.id === f.dataTypeId)
                            if (!type) return false
                            const variant = type.variants.find((v) => v.id === f.dataTypeVariantId)
                            if (!variant) return false
                            if (variant.ai.check) return true
                            return false
                        })
                        .forEach((f) => {
                            data[f.fieldId] = currentData[f.fieldId]
                        })
                } else {
                    contentType.fields
                        ?.filter((f) => fields.includes(f.fieldId))
                        .forEach((f) => {
                            data[f.fieldId] = currentData[f.fieldId]
                        })
                }

                const body: PostAIRequest = {
                    module: "check",
                    data: data,
                    languages: {
                        from: language,
                    },
                    details: {},
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
                        title: t("ai_check_start_error"),
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
                <CheckboxInput
                    subject="Scope"
                    align="top"
                    checked={allFields}
                    onChange={setAllFields}
                    uncheckedBody={
                        <VStack w="100%" alignItems={"flex-start"}>
                            <Box w="100%">{t("ai_check_prepare_title")}</Box>
                            <Table>
                                <Thead>
                                    <Tr>
                                        <Th>{t("ai_check_prepare_field")}</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {contentType.fields
                                        ?.filter((f) => {
                                            const type = dataTypes.find((p) => p.id === f.dataTypeId)
                                            if (!type) return false
                                            const variant = type.variants.find((v) => v.id === f.dataTypeVariantId)
                                            if (!variant) return false
                                            if (variant.ai.check) return true
                                            return false
                                        })
                                        .map((f) => {
                                            return (
                                                <Tr key={f.fieldId}>
                                                    <Td>
                                                        <SimpleCheckboxInput
                                                            checked={fields.includes(f.fieldId)}
                                                            description={f.name}
                                                            onChange={(checked) => {
                                                                let newItems = [...fields]
                                                                if (checked) {
                                                                    if (!newItems.includes(f.fieldId)) {
                                                                        newItems.push(f.fieldId)
                                                                    }
                                                                } else {
                                                                    if (newItems.includes(f.fieldId)) {
                                                                        newItems = newItems.filter((n) => n !== f.fieldId)
                                                                    }
                                                                }
                                                                setFields(newItems)
                                                            }}
                                                        ></SimpleCheckboxInput>
                                                    </Td>
                                                </Tr>
                                            )
                                        })}
                                </Tbody>
                            </Table>
                        </VStack>
                    }
                    checkedBody={<>{t("ai_check_prepare_all")}</>}
                ></CheckboxInput>
            </Box>
        )
    }
    return null
}
