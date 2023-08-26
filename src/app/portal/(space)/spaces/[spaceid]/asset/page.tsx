"use client"
import { SpaceItem } from "@/app/api/space/get"
import { Empty } from "@/components/Empty"
import { FilterItem, SelectionList } from "@/components/SelectionList"
import TextInput from "@/components/TextInput"
import { UploadButton } from "@/components/UploadButton"
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
    Tr, useToast, VStack
} from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import { Search } from "react-feather"

export default function Home({ params }: { params: { spaceid: string } }) {
    const router = useRouter()
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
                    folders.push({ id: item.assetFolderId, name: item.folderName || "Unknown folder" })
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
                                                router.push(`/portal/spaces/${params.spaceid}/asset/folder`)
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
                                        subject="TYPE"
                                        items={filterTypes}
                                        selectedItemId={filterType}
                                        onClick={setFilterType}
                                        anyText="Any type"
                                    ></SelectionList>

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

                                </VStack>
                            </Flex>
                            <Flex flex={1}>
                                <Box p={10} w="100%" maxW="1400px">
                                    <HStack w="100%" alignItems={"center"} gap={10}>
                                        <Heading>All assets</Heading>
                                        <Box flex={1}>
                                            <HStack justifyContent={"flex-start"} gap={3}>
                                                <Search></Search>
                                                <Box w="300px">
                                                    <TextInput
                                                        value=""
                                                        placeholder="Search for assets"
                                                        bg="#fff"
                                                        focus={true}
                                                        onChange={setFilterSearch}
                                                        onSubmit={setFilterSearch}
                                                    ></TextInput>
                                                </Box>
                                            </HStack>
                                        </Box>
                                        <UploadButton text="Create" spaceId={params.spaceid} onUploaded={(asset) => {
                                            queryClient.invalidateQueries([["asset"]]);
                                            router.push(`/portal/spaces/${params.spaceid}/asset/${asset.assetId}`)
                                        }}></UploadButton>
                                    </HStack>
                                    <Box pt={5}>
                                        {filteredItems.length > 0 ? (
                                            <Table w="100%">
                                                <Thead>
                                                    <Tr>
                                                        <Th>NAME</Th>
                                                        <Th>TYPE</Th>
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
                                                            key={item.assetId}
                                                            onClick={() => {
                                                                router.push(`/portal/spaces/${params.spaceid}/asset/${item.assetId}`)
                                                            }}
                                                        >
                                                            <Td fontWeight="600">{item.name}</Td>
                                                            <Td>{item.type.toUpperCase()}</Td>

                                                            <Td>{dayjs(item.modifiedDate).format("YYYY-MM-DD")}</Td>
                                                            <Td>{item.modifiedUserName}</Td>
                                                            <Td>
                                                                {item.status == "disabled" ? (
                                                                    <Tag colorScheme="red" ml={5}>
                                                                        DISABLED
                                                                    </Tag>
                                                                ) : (
                                                                    <Tag colorScheme="green" ml={5}>
                                                                        ENABLED
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
