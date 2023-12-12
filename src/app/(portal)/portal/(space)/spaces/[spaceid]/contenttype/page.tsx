"use client"
import { Box, Button, Center, Container, Flex, Heading, HStack, Spinner, Table, Tbody, Td, Th, Thead, Tr, useToast, VStack } from "@chakra-ui/react"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import TextInput from "@/components/TextInput"
import { Inbox, Loader, Search, Sliders, X } from "react-feather"
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
    const { contenttypes, isLoading: isContenttypesLoading } = useContentypes(params.spaceid, {})

    const [filterStatus, setFilterStatus] = useState<string>("")
    const [filterSearch, setFilterSearch] = useState<string>("")
    const [filterVisibility, setFilterVisibility] = useState<string>("")
    const [filteredItems, setFilteredItems] = useState<
        {
            enabled: boolean
            name: string
            contentTypeId: string
        }[]
    >([])

    useEffect(() => {
        if (!contenttypes) return
        const filtered = contenttypes.filter((item) => {
            if(item.managedByModule) return false;
            if (filterStatus) {
                if (item.enabled !== (filterStatus === "enabled")) return false
            }
            if (filterVisibility){
                if (item.hidden !== (filterVisibility === "hidden")) return false
            }
            if (filterSearch) {
                let searchMatch = false
                if (item.name.toLocaleLowerCase().includes(filterSearch.toLocaleLowerCase())) searchMatch = true
                if (!searchMatch) return false
            }

            return true
        })

        setFilteredItems(filtered)
    }, [contenttypes, filterStatus, filterSearch, filterVisibility])

    const languageOptions = languages.map((l) => ({ key: l.code, text: l.name }))
    useEffect(() => {
        if (!profile) return
        if (!spaces) return
        if (!contenttypes) return
        if (mode !== "loading") return

        if (contenttypes.length > 0) {
            setMode("list")
        } else {
            setMode("create")
        }
    }, [profile, spaces, contenttypes, mode])

    async function create(name: string) {
        setCreateLoading(true)
        try {
            const response = await apiClient.post<PostContenTypeResponse, PostContentTypeRequest>({
                path: `/space/${params.spaceid}/contenttype`,
                isAuthRequired: true,
                body: {
                    name,
                },
            })
            queryClient.invalidateQueries([["contenttypes", params.spaceid]])
            router.push(`/portal/spaces/${params.spaceid}/contenttype/${response.contenttype.contentTypeId}`)
        } catch (ex) {
            setCreateLoading(false)
            toast({
                title: "Could not create content type",
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
                        {spaces && spaces?.length > 0 && (
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
                                    <Heading>Create a content type.</Heading>
                                    <Box color="grey" fontSize="14px">
                                        <Box>Content types is defining the format of your content.</Box>
                                        <Box mt="5">
                                            A content type is defining what fields of information your content should have. You can have multiple content types for different use
                                            cases, for example one content type for news articles and one for a product information.
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
                                        placeholder="My Content Type"
                                        validate={z.string().min(1)}
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
                                            { id: "enabled", name: "Enabled" },
                                            { id: "disabled", name: "Disabled" },
                                        ]}
                                        selectedItemId={filterStatus}
                                        onClick={setFilterStatus}
                                        anyText="Any status"
                                    ></SelectionList>
                                    <SelectionList
                                        subject="VISIBILITY"
                                        items={[
                                            { id: "visible", name: "Visible" },
                                            { id: "hidden", name: "Hidden" },
                                        ]}
                                        selectedItemId={filterVisibility}
                                        onClick={setFilterVisibility}
                                        anyText="All"
                                    ></SelectionList>

                                </VStack>
                            </Flex>
                            <Flex flex={1}>
                                <Box p={10} w="100%" maxW="1400px">
                                    <HStack w="100%" alignItems={"center"} gap={10}>
                                        <Heading>Content types</Heading>
                                        <Box flex={1}>
                                            <HStack justifyContent={"flex-start"} gap={3}>
                                                <Search></Search>
                                                <Box w="300px">
                                                    <TextInput
                                                        value=""
                                                        placeholder="Search for content types"
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
                                                        <Th>NAME</Th>
                                                        <Th>Id</Th>
                                                        <Th></Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    {filteredItems?.map((s) => (
                                                        <Tr
                                                            key={s.contentTypeId}
                                                            _hover={{ backgroundColor: "#fafafa", cursor: "pointer" }}
                                                            onClick={() => {
                                                                router.push(`/portal/spaces/${params.spaceid}/contenttype/${s.contentTypeId}`)
                                                            }}
                                                        >
                                                            <Td fontWeight="600" color={s.enabled ? undefined : "gray.400"}>
                                                                {s.name}
                                                            </Td>
                                                            <Td color={s.enabled ? undefined : "gray.400"}>{s.contentTypeId}</Td>
                                                            <Td textAlign={"right"}>
                                                                <Button variant={"ghost"}>
                                                                    <HStack spacing={3}>
                                                                        <Box color="blue.500">Configure</Box>

                                                                        <Sliders size={24} />
                                                                    </HStack>
                                                                </Button>
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
