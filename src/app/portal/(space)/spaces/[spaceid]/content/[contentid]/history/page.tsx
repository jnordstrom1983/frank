"use client"
import { SaveMenuBar } from "@/components/SaveMenuBar"
import { useContentItem } from "@/networking/hooks/content"
import { useContenttype } from "@/networking/hooks/contenttypes"
import { useSpaces } from "@/networking/hooks/spaces"
import { useAppStore } from "@/stores/appStore"
import { Box, Center, Container, HStack, Spinner, Table, Tag, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function History({ params }: { params: { spaceid: string; contentid: string } }) {
    const { showMainMenu, hideMainMenu } = useAppStore((state) => state)
    const router = useRouter()
    const { item: content, isLoading: isContentLoading } = useContentItem(params.spaceid, params.contentid, {})
    const { contenttype, isLoading: isContentTypeLoading } = useContenttype(params.spaceid, content?.content.contentTypeId || "", { disabled: !content })
    const { spaces, isLoading: isSpacesLoading } = useSpaces({})
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

    function getTitleMaxLength(title : string){
        if(title.length > 30){
            return `${title.substring(0, 27)}...`
        }
        return title;
    }

    return (
        <>
            {isContentLoading || isContentTypeLoading || isSpacesLoading ? (
                <Center h="100vh" w="100%">
                    <Spinner size="xl" colorScheme="blue"></Spinner>
                </Center>
            ) : (
                content && (
                    <>
                        <SaveMenuBar
                            neutralText="BACK"
                            onClose={() => {
                                router.back()
                            }}
                            onNeutral={() => {
                                router.back()
                            }}
                        >
                            <HStack spacing={2}>
                                <Box as="span">History of</Box>
                                <Box as="span" fontWeight={"bold"}>
                                    {getTitle()}
                                </Box>
                            </HStack>
                        </SaveMenuBar>
                        <Box backgroundColor={"#fff"} minH={"100vh"} pt="120px" pb={"50px"}>
                            <Container maxW="1000px">
                                <Table w="100%">
                                    <Thead>
                                        <Tr>
                                            <Th>REVISION</Th>
                                            <Th>CHANGES</Th>
                                            <Th>MODIFIED BY</Th>
                                            <Th>MODIFIED</Th>
                                            
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {content.historyItems.map((item) => (
                                            <Tr
                                                _hover={{ backgroundColor: "#fff", cursor: "pointer" }}
                                                key={item.historyId}
                                                onClick={() => {
                                                    router.push(`/portal/spaces/${params.spaceid}/content/${params.contentid}/history/${item.historyId}`)
                                                }}
                                            >
                                                <Td fontWeight="600">
                                                    #{item.revision}
                                                    {item.historyId === content.content.activeHistoryId && (
                                                        <Tag colorScheme="green" ml={5}>
                                                            CURRENT
                                                        </Tag>
                                                    )}
                                                </Td>
                                                <Td>
                                                    {item.changes} {item.changes > 1 ? "changes" : "change"}
                                                </Td>
                                                <Td>{item.userName} </Td>
                                                <Td>{dayjs(item.date).format("YYYY-MM-DD HH:mm")} </Td>

                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </Container>
                        </Box>
                    </>
                )
            )}
        </>
    )
}
