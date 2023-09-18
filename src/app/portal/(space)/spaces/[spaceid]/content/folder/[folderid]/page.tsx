"use client"
import { PutContentTypeItemRequest, PutContentTypeItemResponse } from "@/app/api/space/[spaceid]/contenttype/[contenttypeid]/put"
import { PutFolderItemRequest, PutFolderItemResponse } from "@/app/api/space/[spaceid]/folder/[folderid]/put"
import { CheckboxInput } from "@/components/CheckboxInput"
import { Empty } from "@/components/Empty"
import { SaveMenuBar } from "@/components/SaveMenuBar"
import { SimpleCheckboxInput } from "@/components/SimpleCheckbox"
import TextInput from "@/components/TextInput"
import { Field } from "@/models/field"
import { apiClient } from "@/networking/ApiClient"
import { useContent } from "@/networking/hooks/content"
import { useContenttype, useContentypes } from "@/networking/hooks/contenttypes"
import { useFolders } from "@/networking/hooks/folder"
import { useAppStore } from "@/stores/appStore"
import { Box, Button, Center, Container, Flex, Grid, GridItem, HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, Table, Tag, Tbody, Td, Th, Thead, Tr, VStack, useDisclosure, useToast } from "@chakra-ui/react"
import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { AlignJustify, Sliders, Trash } from "react-feather"


export default function Home({ params }: { params: { spaceid: string; folderid: string } }) {
    const { showMainMenu, hideMainMenu } = useAppStore((state) => state)
    const { folders, isLoading: isFoldersLoading } = useFolders(params.spaceid, {})
    const { contenttypes } = useContentypes(params.spaceid, {})
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const router = useRouter()
    const [name, setName] = useState<string>("")
    const [limited, setLimited] = useState<boolean>(false)
    const [limitedContentTypes, setLimitedContentTypes] = useState<string[]>([])
    const toast = useToast()
    const [isSaveLoading, setIsSaveLoading] = useState<boolean>(false)
    const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false)
    const queryClient = useQueryClient()
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
    useEffect(() => {
        hideMainMenu()
        return () => {
            showMainMenu()
        }
    }, [])
    useEffect(() => {
        if (!folders) return
        if (!contenttypes) return;
        const folder = folders.find(f => f.folderId === params.folderid)
        if (!folder) {
            router.back();
            return;
        }
        setName(folder.name)
        setLimited(folder.contentTypes.length > 0)
        setLimitedContentTypes(folder.contentTypes)
        setIsLoading(false);
    }, [contenttypes, folders])



    const save = async () => {
        setIsSaveLoading(true)
        try {
            await apiClient.put<PutFolderItemResponse, PutFolderItemRequest>({
                path: `/space/${params.spaceid}/folder/${params.folderid}`,
                body: {
                    name,
                    contentTypes: limited ? limitedContentTypes : []
                },
                isAuthRequired: true,
            })
            toast({
                title: `${name} saved.`,
                status: "success",
                position: "bottom-right",
            })
            setIsSaveLoading(false)
            queryClient.removeQueries([["folders", params.spaceid]])
            router.replace(`/portal/spaces/${params.spaceid}/content/folder`)
        } catch (ex) {
            setIsSaveLoading(false)
            toast({
                title: "Could not save folder",
                description: "Please try again.",
                status: "error",
                position: "bottom-right",
            })
        }
    }


    return (
        <>
            {isLoading ? (
                <Center h="100vh" w="100%">
                    <Spinner size="xl" colorScheme="blue"></Spinner>
                </Center>
            ) : (
                <>

                    <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered={true}>
                        <ModalOverlay />
                        <ModalContent maxW="600px">
                            <ModalHeader pt={10} px={10} pb={0}>
                                Delete folder
                            </ModalHeader>
                            <ModalCloseButton right={10} top={10} />
                            <ModalBody overflow="auto" p={10}>
                                <VStack alignItems={"flex-start"} spacing={5}>
                                    <Box>Are you sure you wish to remove this folder?</Box>
                                    <Box>Content stored in this folder will not be removed.</Box>
                                </VStack>
                            </ModalBody>

                            <ModalFooter pb={10} px={10} gap={10}>
                                <Button
                                    isLoading={isDeleteLoading}
                                    colorScheme="red"
                                    mr={3}
                                    minW="150px"
                                    onClick={async () => {

                                        setIsDeleteLoading(true)
                                        try {
                                            await apiClient.delete({
                                                path: `/space/${params.spaceid}/folder/${params.folderid}`,
                                                isAuthRequired: true,
                                            })
                                            toast({
                                                title: `${name} deleted.`,
                                                status: "success",
                                                position: "bottom-right",
                                            })
                                            setIsDeleteLoading(false)
                                            queryClient.removeQueries([["folders", params.spaceid]])
                                            queryClient.removeQueries([["content", params.spaceid]])
                                            router.replace(`/portal/spaces/${params.spaceid}/content/folder`)
                                        } catch (ex) {
                                            setIsDeleteLoading(false)
                                            toast({
                                                title: "Could not delete folder",
                                                description: "Please try again.",
                                                status: "error",
                                                position: "bottom-right",
                                            })
                                        }


                                    }}

                                >
                                    Delete folder
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => {

                                        onDeleteClose()
                                    }}
                                >
                                    Cancel
                                </Button>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>





                    <SaveMenuBar
                        positiveText="SAVE"
                        neutralText="CLOSE"
                        positiveLoading={isSaveLoading}
                        onClose={() => {
                            router.push(`/portal/spaces/${params.spaceid}/content/folder`)
                        }}
                        onNeutral={() => {
                            router.push(`/portal/spaces/${params.spaceid}/content/folder`)
                        }}
                        onPositive={async () => {
                            await save()
                        }}
                    >
                        <HStack spacing={2}>
                            <Box as="span">Configure Folder</Box>
                            <Box as="span" fontWeight={"bold"}>
                                {name}
                            </Box>
                        </HStack>
                    </SaveMenuBar>
                    <Box backgroundColor={"#fff"} minH={"100vh"} pt="120px" pb={"50px"}>
                        <Container maxW="1000px">

                            <VStack w="100%" spacing="60px">

                                <Grid templateColumns="3fr 2fr" rowGap="60px" columnGap={20} w="100%">
                                    <GridItem>
                                        <TextInput subject="Name" placeholder="My Content Type" value={name} onChange={setName} focus={true}></TextInput>
                                    </GridItem>
                                    <GridItem>
                                        <TextInput subject="contentTypeId" value={params.folderid} disabled={true} enableCopy={true}></TextInput>
                                    </GridItem>
                                </Grid>
                                <CheckboxInput checked={limited} align="top" onChange={setLimited} uncheckedBody={<Box>Limit content that can be created in this folder</Box>} checkedBody={
                                    <VStack w="100%" alignItems={"flex-start"}>
                                        <Box w="100%">Only allow the documents of the following content types to be stored in this folder.</Box>
                                        <Table>
                                            <Thead>
                                                <Tr>
                                                    <Th>Content type</Th>
                                                </Tr>

                                            </Thead>
                                            <Tbody>
                                                {contenttypes?.map((c) => {
                                                    return <Tr key={c.contentTypeId}><Td><SimpleCheckboxInput checked={limitedContentTypes.includes(c.contentTypeId)} description={c.name} onChange={(checked) => {
                                                        let newItems = [...limitedContentTypes];
                                                        if (checked) {
                                                            if (!newItems.includes(c.contentTypeId)) {
                                                                newItems.push(c.contentTypeId)
                                                            }
                                                        } else {
                                                            if (newItems.includes(c.contentTypeId)) {
                                                                newItems = newItems.filter(n => n !== c.contentTypeId)
                                                            }
                                                        }
                                                        setLimitedContentTypes(newItems)
                                                    }}></SimpleCheckboxInput></Td></Tr>
                                                })}
                                            </Tbody>
                                        </Table>

                                    </VStack>


                                } subject="Limited"></CheckboxInput>

                                <Box w="100%">
                                    <Box mb={5}>Danger zone</Box>
                                    <Button leftIcon={<Trash></Trash>} onClick={onDeleteOpen}>Delete folder</Button>
                                </Box>

                            </VStack>
                        </Container>
                    </Box>
                </>
            )}
        </>)

}
