"use client"
import { SaveMenuBar } from "@/components/SaveMenuBar"
import { SpaceLanguage } from "@/models/space"
import { useContentItem } from "@/networking/hooks/content"
import { useContenttype } from "@/networking/hooks/contenttypes"
import { useHistoryItem } from "@/networking/hooks/history"
import { useSpaces } from "@/networking/hooks/spaces"
import { useAppStore } from "@/stores/appStore"
import { Box, Center, Container, Divider, HStack, Heading, Spinner, Table, Tag, Tbody, Td, Th, Thead, Tr, VStack, Button, Flex } from "@chakra-ui/react"

import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"

import { apiClient } from "@/networking/ApiClient"
import { PutHistoryItemResponse } from "@/app/api/space/[spaceid]/content/[contentid]/history/[historyid]/put"
import { useQueryClient } from "@tanstack/react-query"
import dayjs from "dayjs"

import relativeTime from "dayjs/plugin/relativeTime"
import { getAllLangauges, usePhrases } from "@/lib/lang"
dayjs.extend(relativeTime)


export default function History({ params }: { params: { spaceid: string; contentid: string, historyid: string } }) {
    const { showMainMenu, hideMainMenu } = useAppStore((state) => state)
    const router = useRouter()
    const { item: content, isLoading: isContentLoading } = useContentItem(params.spaceid, params.contentid, {})
    const { contenttype, isLoading: isContentTypeLoading } = useContenttype(params.spaceid, content?.content.contentTypeId || "", { disabled: !content })
    const { spaces, isLoading: isSpacesLoading } = useSpaces({})
    const queryClient = useQueryClient()
    const { item: historyItem, isLoading: isHistoryLoading } = useHistoryItem(params.spaceid, params.contentid, params.historyid, {})
    const [languages, setLanguages] = useState<SpaceLanguage[]>([])
    const [restoreLoading, setRestoreLoading] = useState<boolean>(false)
    const allLanguages = getAllLangauges()
    const { t } = usePhrases();
    
    useEffect(() => {
        hideMainMenu()
        return () => {
            showMainMenu()
        }
    }, [])

    useEffect(() => {
        if (!historyItem) return;
        const languages: SpaceLanguage[] = []
        historyItem.changes.forEach(c => {
            if (!languages.includes(c.languageId)) languages.push(c.languageId)
        })
        setLanguages(languages);

    }, [historyItem])

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

    function getTitleMaxLength(title : string){
        if(title.length > 30){
            return `${title.substring(0, 27)}...`
        }
        return title;
    }

    function renderValue(value: any) {
        if (typeof (value) === "string") {
            if (value === "") return t("history_item_empty")
            return value;
        }
        if (typeof (value) === "number") {
            return value.toString()
        }
        if (typeof (value) === "object") {
            return <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(value, null, 3)}</pre>
        }
        return `[${typeof (value)}]`
    }

    return (
        <>
            {isContentLoading || isContentTypeLoading || isSpacesLoading || isHistoryLoading ? (
                <Center h="100vh" w="100%">
                    <Spinner size="xl" colorScheme="blue"></Spinner>
                </Center>
            ) : (
                content && historyItem && (
                    <>
                        <SaveMenuBar
                            neutralText={t("history_item_back")}
                            positiveText={content.content.activeHistoryId !== params.historyid ? t("history_item_restore"): undefined}
                            onClose={() => {
                                router.back();

                            }}
                            onNeutral={async () => {


                                router.back();

                            }}
                            positiveLoading={restoreLoading}
                            onPositive={async () => {
                                setRestoreLoading(true);
                                const response = await apiClient.put<PutHistoryItemResponse>({
                                    path: `/space/${params.spaceid}/content/${historyItem.contentId}/history/${historyItem.historyId}`,
                                    isAuthRequired: true,
                                    body: {},
                                })
                                queryClient.removeQueries([["content", params.spaceid]])
                                queryClient.removeQueries([["content", params.contentid]])
                                queryClient.removeQueries([["history", params.contentid]])
                                setRestoreLoading(false);
                                router.replace(`/portal/spaces/${params.spaceid}/content/${params.contentid}`)

                            }}
                        >
                            <HStack spacing={2}>
                                <Box as="span">{t("history_item_revision")} </Box>
                                <Box as="span" fontWeight={"bold"}>
                                    #{historyItem.revision}
                                </Box>
                                <Box as="span">{t("history_item_of")}</Box>
                                <Box as="span" fontWeight={"bold"}>
                                    {getTitle()}
                                </Box>
                            </HStack>
                        </SaveMenuBar>
                        <Box backgroundColor={"#fff"} minH={"100vh"} pt="120px" pb={"50px"}>
                            <Container maxW="1000px">
                                <HStack spacing={20} alignItems="flex-start">

                                    <Box w="250px">
                                        <Box fontWeight="bold" mb={5}>{t("history_item_revisions")}</Box>
                                        <VStack w="100%" alignItems={"flex-start"} divider={<Divider></Divider>}>
                                            {content.historyItems.map((history, index) => (
                                                <Button
                                                    variant="ghost"
                                                    w="100%"
                                                    px="0"
                                                    key={history.historyId}
                                                    onClick={() => {
                                                        router.replace(`/portal/spaces/${content.content.spaceId}/content/${content.content.contentId}/history/${history.historyId}`)
                                                    }}
                                                >
                                                    <HStack w="100%" spacing="3">
                                                        <Box fontWeight={"bold"}>#{history.revision}</Box>
                                                        <Box padding={1} borderRadius="3px" fontSize="12px" bgColor={"gray.200"}>
                                                            {dayjs(history.date).fromNow()}
                                                        </Box>
                                                        <Box fontSize="12px" color="gray.500" flex={1} textAlign="right">
                                                            ({history.changes} {history.changes > 1 ? t("history_item_changes") : t("history_item_change") })
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
                                                        router.push(`/portal/spaces/${content.content.spaceId}/content/${content.content.contentId}/history`)
                                                    }}
                                                >
                                                    <HStack w="100%" spacing="3">
                                                        <Box fontWeight={"bold"}>{content.historyItems.length - 3}</Box>
                                                        <Box>more {content.historyItems.length > 4 ? t("history_item_changes") : t("history_item_change")}</Box>
                                                    </HStack>
                                                </Button>
                                            )}
                                        </VStack>

                                    </Box>

                                    <VStack spacing={10} w="100%" alignItems={"flex-start"}>

                                        <Flex gap={1} flexWrap="wrap">
                                            <Box as="span">{t("history_item_showing")}</Box>
                                            <Box as="span" fontWeight="bold">{historyItem.changes.length}</Box>
                                            <Box as="span">{historyItem.changes.length > 1 ? t("history_item_changes") : t("history_item_change")}  {t("history_item_madeby")}</Box>
                                            <Box as="span" fontWeight="bold"> {historyItem.userName}</Box>
                                            <Box as="span">{t("history_item_on_date")}</Box>
                                            <Box as="span" fontWeight="bold"> {dayjs(historyItem.date).format("YYYY-MM-DD HH:mm")}</Box>


                                        </Flex>
                                        <VStack spacing={20} w="100%" alignItems={"flex-start"}>
                                            {languages.map(l => <Box w="100%" key={l}>

                                                <Heading mb={5}>{allLanguages.find(p => p.code === l)?.name}</Heading>

                                                <VStack w="100%" spacing={5} alignItems={"flex-start"} divider={<Divider borderStyle={"dashed"}></Divider>}>
                                                    {historyItem.changes.filter(p => p.languageId === l).map(change => {
                                                        return <HStack w="100%" spacing={8} alignItems={"flex-start"} key={change.changeId}>
                                                            <Box w="20%" pt={5}>
                                                                {change.fieldId}
                                                            </Box>
                                                            {change.valueAfter !== undefined && change.valueBefore !== undefined ? <>
                                                                <Box w="40%" bgColor="#e8d8d8" borderRadius="3px" p={3}>
                                                                    {renderValue(change.valueBefore)}
                                                                </Box>
                                                                <Box w="40%" bgColor="#e3f1e3" borderRadius="3px" p={3}>
                                                                    {renderValue(change.valueAfter)}
                                                                </Box>
                                                            </> : <>
                                                                {change.valueAfter !== undefined && <Box w="80%" bgColor="#e3f1e3" borderRadius="3px" p={3}>
                                                                    {renderValue(change.valueAfter)}
                                                                </Box>}
                                                                {change.valueBefore !== undefined && <Box w="80%" bgColor="#e8d8d8" borderRadius="3px" p={3}>
                                                                    {renderValue(change.valueBefore)}
                                                                </Box>}
                                                            </>}


                                                        </HStack>

                                                    })}
                                                </VStack>
                                            </Box>
                                            )}


                                        </VStack>
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
