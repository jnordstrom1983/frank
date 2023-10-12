"use client"
import { Box, Button, Center, Container, Flex, Heading, HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, Table, Tag, Tbody, Td, Th, Thead, Tr, useToast, VStack } from "@chakra-ui/react"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import TextInput from "@/components/TextInput"
import { Inbox, Loader, Search, Sliders, Trash2, X } from "react-feather"
import { PostSpaceRequest, PostSpaceResponse } from "@/app/api/space/post"
import { apiClient } from "@/networking/ApiClient"
import { useQueryClient } from "@tanstack/react-query"
import { useSpaces } from "@/networking/hooks/spaces"
import { z } from "zod"
import { languages } from "@/lib/constants"
import { useRouter } from "next/navigation"
import { useProfile } from "@/networking/hooks/user"
import { useContentypes } from "@/networking/hooks/contenttypes"
import { PostContentTypeRequest, PostContenTypeResponse } from "@/app/api/space/[spaceid]/contenttype/post"
import { SelectionList } from "@/components/SelectionList"
import { Empty } from "@/components/Empty"
import { useContent } from "@/networking/hooks/content"
import { Content, ContentInternalViewModel } from "@/models/content"
import dayjs from "dayjs"
import { PutContentTypeItemRequest, PutContentTypeItemResponse } from "@/app/api/space/[spaceid]/contenttype/[contenttypeid]/put"
import { PostContentRequest } from "@/app/api/space/[spaceid]/content/post"
import { PutContentItemRequest, PutContentItemResponse } from "@/app/api/space/[spaceid]/content/[contentid]/put"
import { slugify } from "@/lib/utils"
import { SpaceLanguage } from "@/models/space"
export default function Home({ params }: { params: { spaceid: string } }) {
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
                    name : `Translation - ${name}`,
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
                            output : false
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
                body : {
                    status: "draft",
                    data: [{
                        languageId : space.defaultLanguage,
                        data : {
                            __name : name 
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
                title: "Could not create translation file",
                description: "Please try again.",
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
                                    <Heading>Create a translation file.</Heading>
                                    <Box color="grey" fontSize="14px">
                                        <Box>
                                            Translation files is a set of phrases that you can translate to various languages. On translation file can contain many phrases and
                                            multiple languages.
                                        </Box>
                                        <Box mt="5">
                                            Translation files can be used to handle translations in apps with eg. i18n files. By managing your translations in Frank you can easily
                                            keep all phrases and translations in sync between all languages.
                                        </Box>
                                    </Box>
                                </VStack>
                            </Box>
                            <Box w="50%">
                                <VStack alignItems="flex-start" spacing="10">
                                    <TextInput
                                        subject="Name"
                                        value={name}
                                        disabled={createLoading}
                                        focus={true}
                                        onChange={setName}
                                        placeholder="My Translation"
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
                                            CREATE
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
                                        subject="STATUS"
                                        items={[
                                            { id: "draft", name: "Draft" },
                                            { id: "published", name: "Published" },
                                        ]}
                                        selectedItemId={filterStatus}
                                        onClick={setFilterStatus}
                                        anyText="Any status"
                                    ></SelectionList>
                                </VStack>
                            </Flex>
                            <Flex flex={1}>
                                <Box p={10} w="100%" maxW="1400px">
                                    <HStack w="100%" alignItems={"center"} gap={10}>
                                        <Heading>Translation files</Heading>
                                        <Box flex={1}>
                                            <HStack justifyContent={"flex-start"} gap={3}>
                                                <Search></Search>
                                                <Box w="300px">
                                                    <TextInput
                                                        value=""
                                                        placeholder="Search for translation files"
                                                        bg="#fff"
                                                        focus={true}
                                                        onChange={setFilterSearch}
                                                        onSubmit={setFilterSearch}
                                                    ></TextInput>
                                                </Box>
                                            </HStack>
                                        </Box>
                                        <Button colorScheme={"green"} w="150px" onClick={() => setMode("create")}>
                                            CREATE
                                        </Button>
                                    </HStack>
                                    <Box pt={5}>
                                        {filteredItems.length > 0 ? (
                                            <Table>
                                                <Thead>
                                                    <Tr>
                                                        <Th>Name</Th>
                                                        <Th>Modified</Th>
                                                        <Th>Status</Th>
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
                                                                        DRAFT
                                                                    </Tag>
                                                                ) : (
                                                                    <Tag colorScheme="green" ml={5}>
                                                                        PUBLISHED
                                                                    </Tag>
                                                                )}
                                                            </Td>
                                                        </Tr>
                                                    ))}
                                                </Tbody>
                                            </Table>
                                        ) : (
                                            <Empty message="No items found."></Empty>
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




