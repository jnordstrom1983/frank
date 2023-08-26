"use client"
import { PostContentRequest } from "@/app/api/space/[spaceid]/content/post"
import { SpaceItem } from "@/app/api/space/get"
import { Empty } from "@/components/Empty"
import { FilterItem, SelectionList } from "@/components/SelectionList"
import TextInput from "@/components/TextInput"
import { Content, ContentInternalViewModel } from "@/models/content"
import { apiClient } from "@/networking/ApiClient"
import { useContent } from "@/networking/hooks/content"
import { useContentypes } from "@/networking/hooks/contenttypes"
import { useFolders } from "@/networking/hooks/folder"
import { useSpaces } from "@/networking/hooks/spaces"
import { useProfile } from "@/networking/hooks/user"
import {
    Box,
    Button,
    Center,
    Container,
    Flex,
    HStack,
    Heading,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Spinner,
    Table,
    Tag,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    VStack,
    useToast,
} from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ChevronDown, Layers, Loader, Search, X } from "react-feather"

export default function Home({ params }: { params: { spaceid: string } }) {
    const router = useRouter()
    const [mode, setMode] = useState<"list" | "notready" | "loading" | "create">("loading")
    const { profile } = useProfile()
    const { spaces, isLoading: isSpacesLoading } = useSpaces({ enabled: true })
    const [space, setSpace] = useState<SpaceItem>()
    const { contenttypes, isLoading: isContentypesLoading } = useContentypes(params.spaceid, {})
    const { items: allItems, isLoading: isContentLoading } = useContent(params.spaceid, {})
    const [filterFolders, setFilterFolders] = useState<FilterItem[]>([])
    const [filterContentTypes, setFilterContentTypes] = useState<FilterItem[]>([])
    const [filterUsers, setFilterUsers] = useState<FilterItem[]>([])
    const queryClient = useQueryClient()
    const [filterFolder, setFilterFolder] = useState<string>("")
    const [filterContentType, setFilterContentType] = useState<string>("")
    const [filterUser, setFilterUser] = useState<string>("")
    const [filterStatus, setFilterStatus] = useState<string>("")
    const [filterSearch, setFilterSearch] = useState<string>("")
    const [createContentType, setCreateContentType] = useState<string>("")
    const [createLoading, setCreateLoading] = useState<boolean>(false)
    const [creatableContentTypes, setCreatableContentTypes] = useState<string[]>([])
    const { folders, isLoading: isFoldersLoading } = useFolders(params.spaceid, {})
    const toast = useToast()

    const [filteredItems, setFilteredItems] = useState<ContentInternalViewModel[]>([])

    useEffect(() => {
        if (!allItems) return
        const filtered = allItems.filter((item) => {
            if (filterFolder) {
                if (item.folderId !== filterFolder) return false
            }
            if (filterContentType) {
                if (item.contentTypeId !== filterContentType) return false
            }
            if (filterUser) {
                if (item.modifiedUserId !== filterUser) return false
            }
            if (filterStatus) {
                if (item.status !== filterStatus) return false
            }
            if (filterSearch) {
                let searchMatch = false
                if (item.title.toLocaleLowerCase().includes(filterSearch.toLocaleLowerCase())) searchMatch = true
                if (item.modifiedUserName.toLocaleLowerCase().includes(filterSearch.toLocaleLowerCase())) searchMatch = true
                if (item.folderName) {
                    if (item.folderName.toLocaleLowerCase().includes(filterSearch.toLocaleLowerCase())) searchMatch = true
                }
                if (!searchMatch) return false
            }

            return true
        })

        if (filterFolder) {
            const folder = folders?.find((f) => f.folderId === filterFolder)
            if (!folder) {
                setCreatableContentTypes([])
            } else {
                setCreatableContentTypes(
                    contenttypes
                        ?.filter((item) => {
                            if (filterContentType) {
                                if (item.contentTypeId !== filterContentType) return false
                            }
                            if (!item.enabled) return false
                            if (folder.contentTypes.length === 0) return true
                            if (folder.contentTypes.includes(item.contentTypeId)) return true
                            return false
                        })
                        .map((c) => c.contentTypeId) || []
                )
            }
        } else {
            setCreatableContentTypes(
                contenttypes
                    ?.filter((item) => {
                        if (!item.enabled) return false
                        if (filterContentType) {
                            if (item.contentTypeId !== filterContentType) return false
                        }
                        return true
                    })
                    .map((c) => c.contentTypeId) || []
            )
        }

        setFilteredItems(filtered)
    }, [allItems, filterFolder, filterContentType, filterUser, filterStatus, filterSearch])

    function extractFilters() {
        if (!allItems) return
        let folders: FilterItem[] = []
        let contenttypes: FilterItem[] = []
        let authors: FilterItem[] = []
        let date: FilterItem[] = []

        allItems.forEach((item) => {
            if (item.folderId) {
                const folder = folders.find((f) => f.id === item.folderId)
                if (!folder) {
                    folders.push({ id: item.folderId, name: item.folderName || "Unknown folder" })
                }
            }
            const contenttype = contenttypes.find((c) => c.id === item.contentTypeId)
            if (!contenttype) {
                contenttypes.push({ id: item.contentTypeId, name: item.contentTypeName })
            }
            const author = authors.find((c) => c.id === item.modifiedUserId)
            if (!author) {
                authors.push({ id: item.modifiedUserId, name: item.modifiedUserName })
            }
        })
        setFilterFolders(folders)
        setFilterContentTypes(contenttypes)
        setFilterUsers(authors)
    }

    useEffect(() => {
        extractFilters()
    }, [allItems])

    useEffect(() => {
        if (!profile) return
        if (!spaces) return
        if (!contenttypes) return
        if (!allItems) return
        if (!folders) return
        const space = spaces.find((s) => s.spaceId === params.spaceid)
        setSpace(space)
        if (contenttypes.length > 0) {
            if (allItems.length > 0) {
                setMode("list")
            } else {
                setMode("create")
            }
        } else {
            setMode("notready")
        }
    }, [spaces, profile, contenttypes, allItems, folders])

    async function create(contentTypeId: string) {
        setCreateLoading(true)
        try {
            const content = await apiClient.post<Content, PostContentRequest>({
                path: `/space/${params.spaceid}/content`,
                isAuthRequired: true,
                body: {
                    contentTypeId: contentTypeId,
                    folderId: filterFolder ? filterFolder : undefined,
                },
            })
            setCreateLoading(false)

            router.push(`/portal/spaces/${params.spaceid}/content/${content.contentId}`)
            queryClient.invalidateQueries([["content", params.spaceid]])
        } catch (ex) {
            setCreateLoading(false)
            toast({
                title: "Could not create content",
                description: "Please try again.",
                status: "error",
                position: "bottom-right",
            })
        }
    }

    return (
        <>
            {mode == "loading" && (
                <Center h="100vh" w="100%">
                    <Spinner size="xl" colorScheme="blue"></Spinner>
                </Center>
            )}
            {mode == "notready" && (
                <Box bg="white" mt="-3px" padding="10">
                    {space!.role === "owner" || profile?.role === "admin" ? (
                        <Container maxW="600px">
                            <HStack spacing="10" padding={10}>
                                <Layers size="48px"></Layers>
                                <VStack flex={1} alignItems="flex-start" spacing={5}>
                                    <Heading>Setup content types first.</Heading>
                                    <Box color="grey" fontSize="14px">
                                        <VStack w="100%" alignItems="flex-start">
                                            <Box>Before you can add and manage content you need to setup your Content Types first.</Box>
                                        </VStack>
                                    </Box>

                                    <Button
                                        colorScheme="blue"
                                        onClick={() => {
                                            router.push(`/portal/spaces/${params.spaceid}/contenttype`)
                                        }}
                                    >
                                        EXPLORE CONTENT TYPES
                                    </Button>
                                </VStack>
                            </HStack>
                        </Container>
                    ) : (
                        <Container maxW="600px">
                            <HStack spacing="10" padding={10}>
                                <Loader size="48px"></Loader>
                                <VStack flex={1} alignItems="flex-start">
                                    <Heading>This space is not yet ready.</Heading>
                                    <Box color="grey" fontSize="14px">
                                        <VStack w="100%" alignItems="flex-start">
                                            <Box>This space is not yet fully configured by your space administrators.</Box>
                                            <Box>Please check back later, or ask your administrtors.</Box>
                                        </VStack>
                                    </Box>
                                </VStack>
                            </HStack>
                        </Container>
                    )}
                </Box>
            )}

            {mode == "create" && (
                <Box bg="white" mt="-3px" padding="10">
                    <Container maxW="800px">
                        {spaces && spaces?.length > 0 && (
                            <Flex justifyContent="flex-end" w="100%">
                                <Button
                                    variant={"ghost"}
                                    marginTop={-10}
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
                                    <Heading>Create your first content.</Heading>
                                    <Box color="grey" fontSize="14px">
                                        <Box>
                                            Content is your basic items that contain all your information. Imagine that content can be a document, an article, a product or just
                                            whatever you want.
                                        </Box>
                                        <Box mt="5">
                                            Content belongs to a content type that defines which fields and which information the content can take. To create a new content, select
                                            which content type the new content should have.
                                        </Box>
                                    </Box>
                                </VStack>
                            </Box>
                            <Box w="50%">
                                <VStack alignItems="flex-start" spacing="10">
                                    <TextInput
                                        subject="Content type"
                                        type="select"
                                        options={contenttypes!.filter((c) => c.enabled).map((c) => ({ key: c.contentTypeId, text: c.name }))}
                                        value={createContentType}
                                        disabled={createLoading}
                                        focus={true}
                                        onChange={setCreateContentType}
                                        placeholder="Select content type"
                                    ></TextInput>

                                    <Flex justifyContent="flex-end" w="100%">
                                        <Button
                                            colorScheme={"green"}
                                            w="150px"
                                            isLoading={createLoading}
                                            isDisabled={!createContentType || createLoading}
                                            onClick={async () => {
                                                create(createContentType)
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

            {mode == "list" && contenttypes && (
                <>
                    <Flex style={{ minHeight: "calc(100vh - 78px)" }} flex={1} flexDir={"column"} maxW="1400px">
                        <Flex flex={1} flexDir={"row"}>
                            <Flex bg="#fff" width="250px" p={5}>
                                <VStack spacing={10} alignItems={"flex-start"} w="100%">
                                    {space!.role === "owner" || profile?.role === "admin" ? (
                                        <SelectionList
                                            subject="FOLDER"
                                            items={filterFolders}
                                            selectedItemId={filterFolder}
                                            anyText="Any folder"
                                            onClick={setFilterFolder}
                                            onSettings={() => {
                                                router.push(`/portal/spaces/${params.spaceid}/content/folder`)
                                            }}
                                        ></SelectionList>
                                    ) : (
                                        <SelectionList
                                            minElements={1}
                                            subject="FOLDER"
                                            items={filterFolders}
                                            selectedItemId={filterFolder}
                                            anyText="Any folder"
                                            onClick={setFilterFolder}
                                        ></SelectionList>
                                    )}

                                    <SelectionList
                                        subject="CONTENT TYPE"
                                        items={filterContentTypes}
                                        selectedItemId={filterContentType}
                                        onClick={setFilterContentType}
                                        anyText="Any content type"
                                    ></SelectionList>

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

                                    <SelectionList subject="MODIFIED BY" items={filterUsers} selectedItemId={filterUser} onClick={setFilterUser} anyText="Any user"></SelectionList>
                                </VStack>
                            </Flex>
                            <Flex flex={1}>
                                <Box p={10} w="100%" maxW="1400px">
                                    <HStack w="100%" alignItems={"center"} gap={10}>
                                        <Heading>All content</Heading>
                                        <Box flex={1}>
                                            <HStack justifyContent={"flex-start"} gap={3}>
                                                <Search></Search>
                                                <Box w="300px">
                                                    <TextInput
                                                        value=""
                                                        placeholder="Search for content"
                                                        bg="#fff"
                                                        focus={true}
                                                        onChange={setFilterSearch}
                                                        onSubmit={setFilterSearch}
                                                    ></TextInput>
                                                </Box>
                                            </HStack>
                                        </Box>
                                        {contenttypes.filter((item) => creatableContentTypes.includes(item.contentTypeId)).length > 0 && (
                                            <Menu>
                                                {contenttypes.filter((item) => creatableContentTypes.includes(item.contentTypeId)).length === 1 ? (
                                                    <Button
                                                        colorScheme="green"
                                                        width="150px"
                                                        onClick={() => {
                                                            create(contenttypes.find((item) => creatableContentTypes.includes(item.contentTypeId))!.contentTypeId)
                                                        }}
                                                    >
                                                        CREATE
                                                    </Button>
                                                ) : (
                                                    ({ isOpen }) => (
                                                        <>
                                                            <MenuButton
                                                                isActive={isOpen}
                                                                as={Button}
                                                                colorScheme="green"
                                                                width="150px"
                                                                isLoading={createLoading}
                                                                isDisabled={createLoading}
                                                            >
                                                                <HStack w="100%" justifyContent={"center"}>
                                                                    <Box>CREATE</Box>
                                                                    <ChevronDown></ChevronDown>
                                                                </HStack>
                                                            </MenuButton>
                                                            <MenuList>
                                                                {contenttypes
                                                                    .filter((item) => creatableContentTypes.includes(item.contentTypeId))
                                                                    .map((item) => (
                                                                        <MenuItem
                                                                            key={item.contentTypeId}
                                                                            onClick={async () => {
                                                                                create(item.contentTypeId)
                                                                            }}
                                                                        >
                                                                            {item.name}
                                                                        </MenuItem>
                                                                    ))}
                                                            </MenuList>
                                                        </>
                                                    )
                                                )}
                                            </Menu>
                                        )}
                                    </HStack>
                                    <Box pt={5}>
                                        {filteredItems.length > 0 ? (
                                            <Table w="100%">
                                                <Thead>
                                                    <Tr>
                                                        <Th>TITLE</Th>
                                                        <Th>CONTENT TYPE</Th>
                                                        <Th>MODIFIED</Th>
                                                        <Th>MODIFIED BY</Th>
                                                        <Th>STATUS</Th>
                                                        <Th></Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    {filteredItems.map((item) => (
                                                        <Tr
                                                            _hover={{ backgroundColor: "#fff", cursor: "pointer" }}
                                                            key={item.contentId}
                                                            onClick={() => {
                                                                router.push(`/portal/spaces/${params.spaceid}/content/${item.contentId}`)
                                                            }}
                                                        >
                                                            <Td fontWeight="600">{item.title}</Td>
                                                            <Td>{item.contentTypeName.toUpperCase()}</Td>

                                                            <Td>{dayjs(item.modifiedDate).format("YYYY-MM-DD")}</Td>
                                                            <Td>{item.modifiedUserName}</Td>
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
                                                            <Td></Td>
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
