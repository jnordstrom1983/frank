"use client"
import { SpaceItem } from "@/app/api/space/get"
import { Empty } from "@/components/Empty"
import { FilterItem, SelectionList } from "@/components/SelectionList"
import TextInput from "@/components/TextInput"
import { UploadButton } from "@/components/UploadButton"
import { usePhrases } from "@/lib/lang"
import { AssetInternalViewModel } from "@/models/asset"
import { useAssets, useAssetFolders } from "@/networking/hooks/asset"
import { useFolders } from "@/networking/hooks/folder"
import { useSpaces } from "@/networking/hooks/spaces"
import { useProfile } from "@/networking/hooks/user"
import {
    Box,
    Button,
    Center, Flex, Heading, HStack, Spinner,
    Table,
    Tag,
    Tbody,
    Td,
    Th,
    Thead,
    Tooltip,
    Tr, useToast, VStack
} from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import { Search } from "react-feather"

export default function Home({ params }: { params: { spaceid: string } }) {
    const router = useRouter()
    const { t } = usePhrases();
    const [mode, setMode] = useState<"list" | "loading">("loading")
    const { profile } = useProfile()
    const { spaces, isLoading: isSpacesLoading } = useSpaces({ enabled: true })
    const [space, setSpace] = useState<SpaceItem>()
    //    const { contenttypes, isLoading: isContentypesLoading } = useContentypes(params.spaceid, {})
    const { items: allItems, isLoading: isContentLoading } = useAssets(params.spaceid, {})
    const [filterFolders, setFilterFolders] = useState<FilterItem[]>([])
    const [filterTypes, setFilterTypes] = useState<FilterItem[]>([])
    const queryClient = useQueryClient()
    const [filterFolder, setFilterFolder] = useState<string>("")
    const [filterType, setFilterType] = useState<string>("")
    const [filterStatus, setFilterStatus] = useState<string>("")
    const [filterSearch, setFilterSearch] = useState<string>("")
    const { folders, isLoading: isFoldersLoading } = useAssetFolders(params.spaceid, {})
    const toast = useToast()

    const [filteredItems, setFilteredItems] = useState<AssetInternalViewModel[]>([])

    useEffect(() => {
        if (!allItems) return
        const filtered = allItems.filter((item) => {
            if (filterFolder) {
                if (item.assetFolderId !== filterFolder) return false
            }

            if (filterType) {
                if (item.type !== filterType) return false
            }
            if (filterStatus) {
                if (item.status !== filterStatus) return false
            }
            if (filterSearch) {
                let searchMatch = false
                if (item.name.toLocaleLowerCase().includes(filterSearch.toLocaleLowerCase())) searchMatch = true
                if (item.modifiedUserName.toLocaleLowerCase().includes(filterSearch.toLocaleLowerCase())) searchMatch = true
                if (item.folderName) {
                    if (item.folderName.toLocaleLowerCase().includes(filterSearch.toLocaleLowerCase())) searchMatch = true
                }
                if (!searchMatch) return false
            }


            return true
        })



        setFilteredItems(filtered)
    }, [allItems, filterFolder, filterType, filterStatus, filterSearch])

    function extractFilters() {
        if (!allItems) return
        let folders: FilterItem[] = []
        let types: FilterItem[] = []



        allItems.forEach((item) => {
            if (item.assetFolderId) {
                const folder = folders.find((f) => f.id === item.assetFolderId)
                if (!folder) {
                    folders.push({ id: item.assetFolderId, name: item.folderName || t("asset_home_unknown_folder") })
                }
            }


            const type = types.find((c) => c.id === item.type)
            if (!type) {
                types.push({ id: item.type, name: item.type.toUpperCase() })
            }
        })
        setFilterFolders(folders)
        setFilterTypes(types)
    }

    useEffect(() => {
        extractFilters()
    }, [allItems])

    useEffect(() => {
        if (!profile) return
        if (!allItems) return
        if (!folders) return
        if (!spaces) return

        const space = spaces.find((s) => s.spaceId === params.spaceid)
        setSpace(space)


        setMode("list")
    }, [profile, allItems, folders, spaces])

    return (
        <>
            {mode == "loading" && (
                <Center h="100vh" w="100%">
                    <Spinner size="xl" colorScheme="blue"></Spinner>
                </Center>
            )}


            {mode == "list" && (
                <>
                    <Flex style={{ minHeight: "calc(100vh - 42px)" }} flex={1} flexDir={"column"} maxW="1400px">
                        <Flex flex={1} flexDir={"row"}>
                            <Flex bg="#fff" width="250px" p={5}>
                                <VStack spacing={10} alignItems={"flex-start"} w="100%">
                                    {space!.role === "owner" || profile?.role === "admin" ? (
                                        <SelectionList
                                            subject={t("asset_home_list_filter_folder_subject")}
                                            items={filterFolders}
                                            selectedItemId={filterFolder}
                                            anyText={t("asset_home_list_filter_folder_anytext")}
                                            onClick={setFilterFolder}
                                            settingsTooltip={t("asset_home_list_filter_folder_tooltip")}
                                            onSettings={() => {
                                                router.push(`/portal/spaces/${params.spaceid}/asset/folder`)
                                            }}
                                        ></SelectionList>
                                    ) : (
                                        <SelectionList
                                            minElements={1}
                                            subject={t("asset_home_list_filter_folder_subject")}
                                            items={filterFolders}
                                            selectedItemId={filterFolder}
                                            anyText={t("asset_home_list_filter_folder_anytext")}
                                            onClick={setFilterFolder}
                                        ></SelectionList>
                                    )}

                                    <SelectionList
                                        subject={t("asset_home_list_filter_type_subject")}
                                        items={filterTypes}
                                        selectedItemId={filterType}
                                        onClick={setFilterType}
                                        anyText={t("asset_home_list_filter_type_anytext")}
                                    ></SelectionList>

                                    <SelectionList
                                        subject={t("asset_home_list_filter_status_subject")}
                                        items={[
                                            { id: "enabled", name: t("asset_home_list_filter_status_enabled") },
                                            { id: "disabled", name: t("asset_home_list_filter_status_disabled") },
                                        ]}
                                        selectedItemId={filterStatus}
                                        onClick={setFilterStatus}
                                        anyText={t("asset_home_list_filter_status_anytext")}
                                    ></SelectionList>

                                </VStack>
                            </Flex>
                            <Flex flex={1}>
                                <Box p={10} w="100%" maxW="1400px">
                                    <HStack w="100%" alignItems={"center"} gap={10}>
                                        <Heading>{t("asset_home_list_heading")}</Heading>
                                        <Box flex={1}>
                                            <HStack justifyContent={"flex-start"} gap={3}>
                                                <Search></Search>
                                                <Box w="300px">
                                                    <TextInput
                                                        value=""
                                                        placeholder={t("asset_home_list_serach_placeholder")}
                                                        bg="#fff"
                                                        focus={true}
                                                        onChange={setFilterSearch}
                                                        onSubmit={setFilterSearch}
                                                    ></TextInput>
                                                </Box>
                                            </HStack>
                                        </Box>
                                        
                                            <UploadButton text={t("asset_home_list_create_button")} spaceId={params.spaceid} onUploaded={(asset) => {
                                                queryClient.invalidateQueries([["asset"]]);
                                                router.push(`/portal/spaces/${params.spaceid}/asset/${asset.assetId}`)
                                            }}></UploadButton>
                                        
                                    </HStack>
                                    <Box pt={5}>
                                        {filteredItems.length > 0 ? (
                                            <Table w="100%">
                                                <Thead>
                                                    <Tr>
                                                        <Th>{t("asset_home_list_table_heading_name")}</Th>
                                                        
                                                        <Th width="200px">{t("asset_home_list_table_heading_modified")}</Th>
                                                        
                                                        <Th width="150px">{t("asset_home_list_table_heading_status")}</Th>
                                                        
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    {filteredItems.map((item) => (
                                                        <Tr
                                                            _hover={{ backgroundColor: "#fff", cursor: "pointer" }}
                                                            key={item.assetId}
                                                            onClick={() => {
                                                                router.push(`/portal/spaces/${params.spaceid}/asset/${item.assetId}`)
                                                            }}
                                                        >
                                                            <Td fontWeight="600">
                                                            <Box mb={1}>{item.name}</Box>
                                                                <Tag size="sm" colorScheme="gray">
                                                                    {item.type.toUpperCase()}
                                                                </Tag>
                                                                
                                                                </Td>
                                                            

                                                            <Td>
                                                                <Box>{dayjs(item.modifiedDate).format("YYYY-MM-DD")}</Box>
                                                                <Box fontSize="12px">{item.modifiedUserName}</Box>
                                                            </Td>
                                                            
                                                            <Td>
                                                                {item.status == "disabled" ? (
                                                                    <Tag colorScheme="red" ml={5}>
                                                                        {t("asset_home_list_table_status_disabled")}
                                                                    </Tag>
                                                                ) : (
                                                                    <Tag colorScheme="green" ml={5}>
                                                                        {t("asset_home_list_table_status_enabled")}
                                                                    </Tag>
                                                                )}
                                                            </Td>
                                                            
                                                        </Tr>
                                                    ))}
                                                </Tbody>
                                            </Table>
                                        ) : (
                                            <Empty message={t("asset_home_list_table_noitems")}></Empty>
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
