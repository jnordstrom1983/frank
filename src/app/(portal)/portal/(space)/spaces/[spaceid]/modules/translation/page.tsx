"use client"
import TextInput from "@/components/TextInput"
import { apiClient } from "@/networking/ApiClient"
import { useSpaces } from "@/networking/hooks/spaces"
import { Box, Button, Center, Container, Flex, Heading, HStack, Spinner, Table, Tag, Tbody, Td, Th, Thead, Tr, useToast, VStack } from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { Search, X } from "react-feather"
import { z } from "zod"

import { PutContentItemRequest, PutContentItemResponse } from "@/app/api/space/[spaceid]/content/[contentid]/put"
import { PostContentRequest } from "@/app/api/space/[spaceid]/content/post"
import { PutContentTypeItemRequest, PutContentTypeItemResponse } from "@/app/api/space/[spaceid]/contenttype/[contenttypeid]/put"
import { PostContentTypeRequest, PostContenTypeResponse } from "@/app/api/space/[spaceid]/contenttype/post"
import { Empty } from "@/components/Empty"
import { SelectionList } from "@/components/SelectionList"
import { Content, ContentInternalViewModel } from "@/models/content"
import { useContent } from "@/networking/hooks/content"
import { useProfile } from "@/networking/hooks/user"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { usePhrases } from "@/lib/lang"
export default function Home({ params }: { params: { spaceid: string } }) {
    const { t } = usePhrases();
    const router = useRouter()
    const [mode, setMode] = useState<"list" | "create" | "loading">("loading")
    const [name, setName] = useState<string>("")
    const [createLoading, setCreateLoading] = useState<boolean>(false)
    const [nameValid, setNameValid] = useState<boolean>(false)
    const toast = useToast()
    const queryClient = useQueryClient()
    const { profile } = useProfile()
    const { spaces, isLoading: isSpacesLoading } = useSpaces({ enabled: true })
    const { items, isLoading: isContentLoading } = useContent(params.spaceid, {})

    const [filterStatus, setFilterStatus] = useState<string>("")
    const [filterSearch, setFilterSearch] = useState<string>("")
    const [filteredItems, setFilteredItems] = useState<ContentInternalViewModel[]>([])

    useEffect(() => {
        if (!items) return
        const filtered = items.filter((item) => {

            if (item.managedByModule !== "translation") return false
            if (filterStatus) {
                if (item.status !== filterStatus) return false
            }
            if (filterSearch) {
                let searchMatch = false
                if (item.title.toLowerCase().includes(filterSearch.toLowerCase())) searchMatch = true
                if (!searchMatch) return false
            }

            return true
        })

        setFilteredItems(filtered)
    }, [items, filterStatus, filterSearch])

    useEffect(() => {
        if (!profile) return
        if (!spaces) return
        if (!items) return
        if (mode !== "loading") return

        if (items.length > 0) {
            setMode("list")
        } else {
            setMode("create")
        }
    }, [profile, spaces, items, mode])

    async function create(name: string) {
        setCreateLoading(true)
        try {
            const contentTypeCreateResponse = await apiClient.post<PostContenTypeResponse, PostContentTypeRequest>({
                path: `/space/${params.spaceid}/contenttype`,
                isAuthRequired: true,
                body: {
                    name: `Translation - ${name}`,
                    managedByModule: "translation",
                },
            })

            const contentTypeUpdateResponse = await apiClient.put<PutContentTypeItemResponse, PutContentTypeItemRequest>({
                path: `/space/${params.spaceid}/contenttype/${contentTypeCreateResponse.contenttype.contentTypeId}`,
                isAuthRequired: true,
                body: {
                    name: `Translation - ${name}`,
                    enabled: true,
                    fields: [
                        {
                            fieldId: "__name",
                            dataTypeId: "string",
                            dataTypeVariantId: "textbox",
                            name: "Translation name",
                            description: "",
                            title: true,
                            validators: { required: { enabled: true }, unique: { enabled: false }, minLength: { enabled: false, min: 0 }, maxLength: { enabled: true, max: 4096 } },
                            settings: [],
                            output: false
                        },
                    ],
                    generateSlug: true,
                    hidden: true,

                },
            })


            const contentCreateResponse = await apiClient.post<Content, PostContentRequest>({
                path: `/space/${params.spaceid}/content`,
                isAuthRequired: true,
                body: {
                    contentTypeId: contentTypeCreateResponse.contenttype.contentTypeId,
                    managedByModule: "translation",
                },
            })

            const space = spaces!.find((p) => p.spaceId === params.spaceid)
            if (!space) {
                throw "Space not found"
            }



            const contentUpdateResponse = await apiClient.put<PutContentItemResponse, PutContentItemRequest>({
                path: `/space/${params.spaceid}/content/${contentCreateResponse.contentId}`,
                isAuthRequired: true,
                body: {
                    status: "draft",
                    data: [{
                        languageId: space.defaultLanguage,
                        data: {
                            __name: name
                        }
                    }]
                }
            })
            queryClient.invalidateQueries([["content", params.spaceid]])




            setCreateLoading(false)
            queryClient.invalidateQueries([["content", params.spaceid]])
            queryClient.invalidateQueries([["contenttypes", params.spaceid]])
            router.push(`/portal/spaces/${params.spaceid}/modules/translation/${contentCreateResponse.contentId}`)
        } catch (ex) {
            setCreateLoading(false)
            toast({
                title: t("module_translation_create_error_title"),
                description: t("module_translation_create_error_description"),
                status: "error",
                position: "bottom-right",
            })
            return
        }
    }
    return (
        <>
            {mode == "loading" && (
                <Center h="100vh" w="100%">
                    <Spinner size="xl" colorScheme="blue"></Spinner>
                </Center>
            )}
            {mode == "create" && (
                <Box bg="white" mt="-3px" padding="10">
                    <Container maxW="800px" py="50px">
                        {items && items?.length > 0 && (
                            <Flex justifyContent="flex-end" w="100%">
                                <Button
                                    variant={"ghost"}
                                    marginTop={-5}
                                    onClick={() => {
                                        setMode("list")
                                    }}
                                >
                                    <X size={32} />
                                </Button>
                            </Flex>
                        )}

                        <HStack w="100%" spacing="10" alignItems="flex-start">
                            <Box w="50%">
                                <VStack alignItems="flex-start" spacing="5">
                                    <Heading>{t("module_translation_create_heading")}.</Heading>
                                    <Box color="grey" fontSize="14px">
                                        <Box>
                                            {t("module_translation_create_description1")}
                                        </Box>
                                        <Box mt="5">
                                            {t("module_translation_create_description2")}
                                        </Box>
                                    </Box>
                                </VStack>
                            </Box>
                            <Box w="50%">
                                <VStack alignItems="flex-start" spacing="10">
                                    <TextInput
                                        subject={t("module_translation_create_input_subject")}
                                        value={name}
                                        disabled={createLoading}
                                        focus={true}
                                        onChange={setName}
                                        placeholder={t("module_translation_create_input_placeholder")}
                                        validate={z.string().min(3)}
                                        onValidation={(valid) => {
                                            setNameValid(valid)
                                        }}
                                        onSubmit={(value) => {
                                            create(value)
                                        }}
                                    ></TextInput>

                                    <Flex justifyContent="flex-end" w="100%">
                                        <Button
                                            colorScheme={"green"}
                                            w="150px"
                                            isLoading={createLoading}
                                            isDisabled={!nameValid || createLoading}
                                            onClick={async () => {
                                                create(name)
                                            }}
                                        >
                                            {t("module_translation_create_button")}
                                        </Button>
                                    </Flex>
                                </VStack>
                            </Box>
                        </HStack>
                    </Container>
                </Box>
            )}

            {mode == "list" && (
                <>
                    <Flex style={{ minHeight: "calc(100vh - 42px)" }} flex={1} flexDir={"column"} maxW="1400px">
                        <Flex flex={1} flexDir={"row"}>
                            <Flex bg="#fff" width="250px" p={5}>
                                <VStack spacing={10} alignItems={"flex-start"} w="100%">
                                    <SelectionList
                                        subject={t("module_translation_filter_status_subject")}
                                        items={[
                                            { id: "draft", name: t("module_translation_filter_status_draft") },
                                            { id: "published", name: t("module_translation_filter_status_published") },
                                        ]}
                                        selectedItemId={filterStatus}
                                        onClick={setFilterStatus}
                                        anyText={t("module_translation_filter_status_any")}
                                    ></SelectionList>
                                </VStack>
                            </Flex>
                            <Flex flex={1}>
                                <Box p={10} w="100%" maxW="1400px">
                                    <HStack w="100%" alignItems={"center"} gap={10}>
                                        <Heading>{t("module_translation_heading")}</Heading>
                                        <Box flex={1}>
                                            <HStack justifyContent={"flex-start"} gap={3}>
                                                <Search></Search>
                                                <Box w="300px">
                                                    <TextInput
                                                        value=""
                                                        placeholder={t("module_translation_search_placeholder")}
                                                        bg="#fff"
                                                        focus={true}
                                                        onChange={setFilterSearch}
                                                        onSubmit={setFilterSearch}
                                                    ></TextInput>
                                                </Box>
                                            </HStack>
                                        </Box>
                                        <Button colorScheme={"green"} w="150px" onClick={() => setMode("create")}>
                                            {t("module_translation_create")}
                                        </Button>
                                    </HStack>
                                    <Box pt={5}>
                                        {filteredItems.length > 0 ? (
                                            <Table>
                                                <Thead>
                                                    <Tr>
                                                        <Th>{t("module_translation_list_table_heading_name")}</Th>
                                                        <Th>{t("module_translation_list_table_heading_modified")}</Th>
                                                        <Th>{t("module_translation_list_table_heading_status")}</Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    {filteredItems?.map((item) => (
                                                        <Tr
                                                            key={item.contentId}
                                                            _hover={{ backgroundColor: "#fafafa", cursor: "pointer" }}
                                                            onClick={() => {
                                                                router.push(`/portal/spaces/${params.spaceid}/modules/translation/${item.contentId}`)
                                                            }}
                                                        >
                                                            <Td fontWeight="600">{item.title}</Td>
                                                            <Td>
                                                                <Box>{dayjs(item.modifiedDate).format("YYYY-MM-DD")}</Box>
                                                                <Box fontSize="12px">{item.modifiedUserName}</Box>
                                                            </Td>
                                                            <Td>
                                                                {item.status == "draft" ? (
                                                                    <Tag colorScheme="red" ml={5}>
                                                                        {t("module_translation_list_table_draft")}
                                                                    </Tag>
                                                                ) : (
                                                                    <Tag colorScheme="green" ml={5}>
                                                                        {t("module_translation_list_table_published")}
                                                                    </Tag>
                                                                )}
                                                            </Td>
                                                        </Tr>
                                                    ))}
                                                </Tbody>
                                            </Table>
                                        ) : (
                                            <Empty message={t("module_translation_list_no_items_found")}></Empty>
                                        )}
                                    </Box>
                                </Box>
                            </Flex>
                        </Flex>
                    </Flex>
                </>
            )}
        </>
    )
}




