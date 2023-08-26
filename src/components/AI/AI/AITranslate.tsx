import { PostAIRequest, PostAIResponse } from "@/app/api/space/[spaceid]/ai/post"
import { dataTypes, languages } from "@/lib/constants"
import { ContentData } from "@/models/contentdata"
import { ContentType } from "@/models/contentype"
import { SpaceLanguage } from "@/models/space"
import { apiClient } from "@/networking/ApiClient"
import { useSpaces } from "@/networking/hooks/spaces"
import { Box, Flex, Table, Tbody, Td, Th, Thead, Tr, VStack, useToast } from "@chakra-ui/react"
import { ReactElement, useEffect, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { CheckboxInput } from "../../CheckboxInput"
import { SimpleCheckboxInput } from "../../SimpleCheckbox"
import { AIState } from "./AI"

export function AITranslate({
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
        setTaskTitle("Translate")
    }, [])

    const [allFields, setAllFields] = useState<boolean>(true)
    const [fields, setFields] = useState<string[]>([])

    useEffect(() => {
        setState("prepare")
    }, [spaces])

    useEffect(() => {
        if (!result) return


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
            const keys = Object.keys(result)
            keys.forEach((key) => {
                updatedDatas[index].data[key] = result[key]
            })
            updateDatas(updatedDatas)
            onClose()
        }
    }, [result])

    const fromLanguage = spaces?.find((p) => p.spaceId === spaceId)?.defaultLanguage || "en"

    function getLanguageName(language: string) {
        return languages.find((p) => p.code === language)?.name || "-"
    }

    useEffect(() => {
        if (allFields) {
            setTaskDescription(
                <Flex gap={1} flexWrap={"wrap"}>
                    <Box as="span">Translate </Box>
                    <Box as="span" fontWeight={"bold"}>
                        all
                    </Box>
                    <Box as="span">translatable texts from</Box>
                    <Box as="span" fontWeight={"bold"}>
                        {getLanguageName(fromLanguage)}
                    </Box>
                    <Box as="span">to</Box>
                    <Box as="span" fontWeight={"bold"}>
                        {getLanguageName(language)}
                    </Box>
                </Flex>
            )
            setReady(true)
        } else {
            if (fields.length === 0) {
                setTaskDescription(<Box>Select fields to translate.</Box>)
                setReady(false)
            } else {
                setTaskDescription(
                    <Flex gap={1} flexWrap={"wrap"}>
                        <Box as="span">Translate </Box>
                        <Box fontWeight={"bold"}>
                            {fields
                                .map((f) => {
                                    return f
                                })
                                .join(", ")}
                        </Box>
                        <Box as="span"> from </Box>
                        <Box as="span" fontWeight={"bold"}>
                            {getLanguageName(fromLanguage)}
                        </Box>
                        <Box as="span">to</Box>
                        <Box as="span" fontWeight={"bold"}>
                            {getLanguageName(language)}
                        </Box>
                    </Flex>
                )
                setReady(true)
            }
        }
    }, [allFields, fields])

    useEffect(() => {
        if (state === "processing") {
            ; (async () => {
                const data: Record<string, any> = {}
                const defaultLanguage: Record<string, any> = datas.find((p) => p.languageId === fromLanguage)?.data || {}

                if (allFields) {
                    contentType.fields
                        ?.filter((f) => {
                            const type = dataTypes.find((p) => p.id === f.dataTypeId)
                            if (!type) return false
                            const variant = type.variants.find((v) => v.id === f.dataTypeVariantId)
                            if (!variant) return false
                            if (variant.ai.translate) return true
                            return false
                        })
                        .forEach((f) => {
                            data[f.fieldId] = defaultLanguage[f.fieldId]
                        })
                } else {
                    contentType.fields
                        ?.filter((f) => fields.includes(f.fieldId))
                        .forEach((f) => {
                            data[f.fieldId] = defaultLanguage[f.fieldId]
                        })
                }

                const body: PostAIRequest = {
                    module: "translate",
                    data: data,
                    languages: {
                        from: fromLanguage,
                        to: language,
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
                        title: "Could not start AI task",
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
                            <Box w="100%">Check the following fields.</Box>
                            <Table>
                                <Thead>
                                    <Tr>
                                        <Th>Field</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {contentType.fields
                                        ?.filter((f) => {
                                            const type = dataTypes.find((p) => p.id === f.dataTypeId)
                                            if (!type) return false
                                            const variant = type.variants.find((v) => v.id === f.dataTypeVariantId)
                                            if (!variant) return false
                                            if (variant.ai.translate) return true
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
                    checkedBody={<>All translatable content</>}
                ></CheckboxInput>
            </Box>
        )
    }
    return null
}
