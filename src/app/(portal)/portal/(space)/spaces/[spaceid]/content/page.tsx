"use client"
import { PostContentRequest } from "@/app/api/space/[spaceid]/content/post"
import { SpaceItem } from "@/app/api/space/get"
import { Empty } from "@/components/Empty"
import { FilterItem, SelectionList } from "@/components/SelectionList"
import TextInput from "@/components/TextInput"
import { usePhrases } from "@/lib/lang"
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
    Tooltip,
    Tr,
    VStack,
    useToast,
} from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ChevronDown, Eye, EyeOff, Layers, Loader, Search, Trash2, X } from "react-feather"

export default function Home({ params }: { params: { spaceid: string } }) {

    const { t } = usePhrases();

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
    const [filterDates, setFilterDates] = useState<FilterItem[]>([])
    const queryClient = useQueryClient()
    const [filterFolder, setFilterFolder] = useState<string>("")
    const [filterContentType, setFilterContentType] = useState<string>("")
    const [filterUser, setFilterUser] = useState<string>("")
    const [filterStatus, setFilterStatus] = useState<string>("")
    const [filterSearch, setFilterSearch] = useState<string>("")
    const [filterDate, setFilterDate] = useState<string>("")
    const [createContentType, setCreateContentType] = useState<string>("")
    const [createLoading, setCreateLoading] = useState<boolean>(false)
    const [creatableContentTypes, setCreatableContentTypes] = useState<string[]>([])
    const { folders, isLoading: isFoldersLoading } = useFolders(params.spaceid, {})
    const [showHidden, setShowHidden] = useState<boolean>(false)
    const toast = useToast()

    const [filteredItems, setFilteredItems] = useState<ContentInternalViewModel[]>([])
    const [allVisibleItems, setAllVisibileItems] = useState<ContentInternalViewModel[]>()

    useEffect(()=>{
        if(!contenttypes) return;
        if(!allItems) return;

       if(showHidden){
            setAllVisibileItems([...allItems].filter(p=>!p.managedByModule))
       }else{
            setAllVisibileItems([...allItems].filter(p=>{
                if(p.managedByModule) return false;
                const contentType = contenttypes.find(c=>c.contentTypeId === p.contentTypeId);
                if(contentType && contentType.hidden) return false
                return true;
            }))
       }
    }, [contenttypes, allItems, showHidden])

    useEffect(() => {
        if (!allVisibleItems) return
        const filtered = allVisibleItems.filter((item) => {
            if(item.managedByModule) return false;
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
                if (filterStatus === "scheduled") {
                    if (item.status === "draft" && item.scheduledPublishDate) return true
                }
                if (filterStatus === "draft") {
                    if (item.status === "draft" && item.scheduledPublishDate) return false
                }
                if (item.status !== filterStatus) return false
            }

            if (filterDate) {
                const date = dayjs(item.modifiedDate)

                switch (filterDate) {
                    case "today":
                        if (!date.isSame(new Date(), "day")) return false
                        break
                    case "yesterday":
                        if (!date.isSame(dayjs(new Date()).add(-1, "day"), "day")) return false
                        break
                    case "this_month":
                        if (!date.isSame(new Date(), "month")) return false
                        break
                    case "last_month":
                        if (!date.isSame(dayjs(new Date()).add(-1, "month"), "month")) return false
                        break
                    case "this_year":
                        if (!date.isSame(new Date(), "year")) return false
                        break
                    case "last_year":
                        if (!date.isSame(dayjs(new Date()).add(-1, "year"), "year")) return false
                        break
                }
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
                            if(!showHidden && item.hidden) return false;
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
                        if(!showHidden && item.hidden) return false;
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
    }, [allVisibleItems, filterFolder, filterContentType, filterUser, filterStatus, filterSearch, filterDates, filterDate, showHidden])

    function extractFilters() {
        if (!allVisibleItems) return
        let folders: FilterItem[] = []
        let contenttypes: FilterItem[] = []
        let authors: FilterItem[] = []
        let dates: FilterItem[] = []

        const foundDates = {
            today: false,
            yesterday: false,
            this_month: false,
            last_month: false,
            this_year: false,
            last_year: false,
        }
        allVisibleItems.forEach((item) => {
            if (item.folderId) {
                const folder = folders.find((f) => f.id === item.folderId)
                if (!folder) {
                    folders.push({ id: item.folderId, name: item.folderName || t("content_page_unknown_folder") })
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

            const date = dayjs(item.modifiedDate)
            if (date.isSame(new Date(), "day")) {
                foundDates.today = true
            }

            if (date.isSame(dayjs(new Date()).add(-1, "day"), "day")) {
                foundDates.yesterday = true
            }

            if (date.isSame(new Date(), "month")) {
                foundDates.this_month = true
            }

            if (date.isSame(dayjs(new Date()).add(-1, "month"), "month")) {
                foundDates.last_month = true
            }

            if (date.isSame(new Date(), "year")) {
                foundDates.this_year = true
            }

            if (date.isSame(dayjs(new Date()).add(-1, "year"), "year")) {
                foundDates.last_year = true
            }
        })

        dates = []
        if (foundDates.today) dates.push({ id: "today", name: t("today") })
        if (foundDates.yesterday) dates.push({ id: "yesterday", name:  t("yesterday") })
        if (foundDates.this_month) dates.push({ id: "this_month", name: t("this_month") })
        if (foundDates.last_month) dates.push({ id: "last_month", name: t("last_month") })
        if (foundDates.this_year) dates.push({ id: "this_year", name: t("this_year")})
        if (foundDates.last_year) dates.push({ id: "last_year", name:t("last_year") })

        setFilterFolders(folders)
        setFilterContentTypes(contenttypes)
        setFilterUsers(authors)
        setFilterDates(dates)
    }

    useEffect(() => {
        extractFilters()
    }, [allVisibleItems])

    useEffect(() => {
        if (!profile) return
        if (!spaces) return
        if (!contenttypes) return
        if (!allItems) return
        if(!allVisibleItems) return;
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
    }, [spaces, profile, contenttypes, allItems,allVisibleItems, folders])

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
                title: t("content_page_create_error_title"),
                description: t("content_page_create_error_description"),
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
                        <Container maxW="600px" py="50px">
                            <HStack spacing="10" padding={10}>
                                <Layers size="48px"></Layers>
                                <VStack flex={1} alignItems="flex-start" spacing={5}>
                                    <Heading>{t("content_page_not_ready_owner_heading")}</Heading>
                                    <Box color="grey" fontSize="14px">
                                        <VStack w="100%" alignItems="flex-start">
                                            <Box>{t("content_page_not_ready_owner_description")}</Box>
                                        </VStack>
                                    </Box>

                                    <Button
                                        colorScheme="blue"
                                        onClick={() => {
                                            router.push(`/portal/spaces/${params.spaceid}/contenttype`)
                                        }}
                                    >
                                        {t("content_page_not_ready_owner_button")}
                                    </Button>
                                </VStack>
                            </HStack>
                        </Container>
                    ) : (
                        <Container maxW="600px" py="50px">
                            <HStack spacing="10" padding={10}>
                                <Loader size="48px"></Loader>
                                <VStack flex={1} alignItems="flex-start">
                                    <Heading>{t("content_page_not_ready_user_heading")}</Heading>
                                    <Box color="grey" fontSize="14px">
                                        <VStack w="100%" alignItems="flex-start">
                                            <Box>{t("content_page_not_ready_user_description1")}</Box>
                                            <Box>{t("content_page_not_ready_user_description2")}</Box>
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
                    <Container maxW="800px" py="50px">
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
                                    <Heading>{t("content_page_create_heading")}</Heading>
                                    <Box color="grey" fontSize="14px">
                                        <Box>
                                           {t("content_page_create_description1")}
                                        </Box>
                                        <Box mt="5">
                                            {t("content_page_create_description2")}
                                        </Box>
                                    </Box>
                                </VStack>
                            </Box>
                            <Box w="50%">
                                <VStack alignItems="flex-start" spacing="10">
                                    <TextInput
                                        subject={t("content_page_create_input_subject")}
                                        type="select"
                                        options={contenttypes!.filter((c) => c.enabled).map((c) => ({ key: c.contentTypeId, text: c.name }))}
                                        value={createContentType}
                                        disabled={createLoading}
                                        focus={true}
                                        onChange={setCreateContentType}
                                        placeholder={t("content_page_create_input_placeholder")}
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
                                            {t("create")}
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
                    <Flex style={{ minHeight: "calc(100vh - 42px)" }} flex={1} flexDir={"column"} maxW="1400px">
                        <Flex flex={1} flexDir={"row"}>
                            <Flex bg="#fff" width="250px" p={5}>
                                <VStack spacing={10} alignItems={"flex-start"} w="100%">
                                
                                    <SelectionList
                                        subject={t("content_page_filter_folder_subject")}
                                        items={filterFolders}
                                        selectedItemId={filterFolder}
                                        anyText={t("content_page_filter_folder_anytext")}
                                        onClick={setFilterFolder}
                                        onSettings={() => {
                                            router.push(`/portal/spaces/${params.spaceid}/content/folder`)
                                        }}
                                        settingsTooltip={t("content_page_filter_folder_tooltip")}
                                    ></SelectionList>

                                    <SelectionList
                                        subject={t("content_page_filter_contenttype_subject")}
                                        items={filterContentTypes}
                                        selectedItemId={filterContentType}
                                        onClick={setFilterContentType}
                                        anyText={t("content_page_filter_contenttype_anytext")}
                                        
                                        settingsIcon={showHidden ? <EyeOff></EyeOff> : <Eye></Eye>}
                                        settingsTooltip={showHidden ?   t("content_page_filter_contenttype_tooltip_hide") : t("content_page_filter_contenttype_tooltip_show") }
                                        onSettings={() => {
                                            setShowHidden(!showHidden)
                                        }}
                                    ></SelectionList>




                                    <SelectionList
                                        subject={t("content_page_filter_status_subject")}
                                        items={[
                                            { id: "draft", name: t("content_page_filter_status_status_draft") },
                                            { id: "published", name: t("content_page_filter_status_status_published")},
                                            { id: "scheduled", name: t("content_page_filter_status_status_scheduled") },
                                        ]}
                                        selectedItemId={filterStatus}
                                        onClick={setFilterStatus}
                                        anyText={t("content_page_filter_status_anytext")}
                                        settingsIcon={<Trash2></Trash2>}
                                        onSettings={() => {
                                            router.push(`/portal/spaces/${params.spaceid}/content/trash`)
                                        }}
                                        settingsTooltip={t("content_page_filter_status_tooltip")}
                                    ></SelectionList>
  

                                    <SelectionList subject={t("content_page_filter_modifiedby_subject")} items={filterUsers} selectedItemId={filterUser} onClick={setFilterUser} anyText={t("content_page_filter_modifiedby_anytext")}></SelectionList>

                                    <SelectionList subject={t("content_page_filter_modified_subject")} items={filterDates} selectedItemId={filterDate} onClick={setFilterDate} anyText={t("content_page_filter_modified_anytext")}></SelectionList>
                                </VStack>
                            </Flex>
                            <Flex flex={1}>
                                <Box p={10} w="100%" maxW="1400px">
                                    <HStack w="100%" alignItems={"center"} gap={10}>
                                        <Heading>{t("content_page_list_heading")}</Heading>
                                        <Box flex={1}>
                                            <HStack justifyContent={"flex-start"} gap={3}>
                                                <Search></Search>
                                                <Box w="300px">
                                                    <TextInput
                                                        value=""
                                                        placeholder={t("content_page_list_search_placeholder")}
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
                                                    <Tooltip label={t("content_page_list_create_tooltip", contenttypes.find((item) => creatableContentTypes.includes(item.contentTypeId))!.name)}>
                                                        <Button
                                                            colorScheme="green"
                                                            width="150px"
                                                            onClick={() => {
                                                                create(contenttypes.find((item) => creatableContentTypes.includes(item.contentTypeId))!.contentTypeId)
                                                            }}
                                                        >
                                                            {t("create")}
                                                        </Button>
                                                    </Tooltip>
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
                                                                    <Box>{t("create")}</Box>
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
                                                        <Th>{t("content_page_list_table_header_title")}</Th>

                                                        <Th w="20%">{t("content_page_list_table_header_modified")}</Th>

                                                        <Th w="10%" minWidth="150px">{t("content_page_list_table_header_status")}</Th>

                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    {filteredItems.slice(0, 250).map((item) => (
                                                        <Tr
                                                            _hover={{ backgroundColor: "#fff", cursor: "pointer" }}
                                                            key={item.contentId}
                                                            onClick={() => {
                                                                router.push(`/portal/spaces/${params.spaceid}/content/${item.contentId}`)
                                                            }}
                                                        >
                                                            <Td fontWeight="600">
                                                                <Box mb={1}>{item.title}</Box>
                                                                <Tag size="sm" colorScheme="gray">
                                                                    {item.contentTypeName.toUpperCase()}
                                                                </Tag>
                                                            </Td>

                                                            <Td>
                                                                <Box>{dayjs(item.modifiedDate).format("YYYY-MM-DD")}</Box>
                                                                <Box fontSize="12px">{item.modifiedUserName}</Box>
                                                            </Td>

                                                            <Td>
                                                                {item.status == "draft" ? (
                                                                    item.scheduledPublishDate ? (
                                                                        <Tag colorScheme="orange" ml={5}>
                                                                            {t("content_page_list_table_status_scheduled")}
                                                                        </Tag>
                                                                    ) : (
                                                                        <Tag colorScheme="red" ml={5}>
                                                                            {t("content_page_list_table_status_draft")}
                                                                        </Tag>
                                                                    )
                                                                ) : (
                                                                    <Tag colorScheme="green" ml={5}>
                                                                        {t("content_page_list_table_status_published")}
                                                                    </Tag>
                                                                )}
                                                            </Td>
                                                            
                                                        </Tr>
                                                    ))}
                                                </Tbody>
                                            </Table>
                                        ) : (
                                            <Empty message={t("content_page_list_empty")}></Empty>
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
