"use client"
import { PutAssetFolderItemResponse, PutAssetFolderItemRequest } from "@/app/api/space/[spaceid]/asset/folder/[folderid]/put"
import { PutContentTypeItemRequest, PutContentTypeItemResponse } from "@/app/api/space/[spaceid]/contenttype/[contenttypeid]/put"
import { PutFolderItemRequest, PutFolderItemResponse } from "@/app/api/space/[spaceid]/folder/[folderid]/put"
import { CheckboxInput } from "@/components/CheckboxInput"
import { Empty } from "@/components/Empty"
import { SaveMenuBar } from "@/components/SaveMenuBar"
import { SimpleCheckboxInput } from "@/components/SimpleCheckbox"
import TextInput from "@/components/TextInput"
import { usePhrases } from "@/lib/lang"
import { Field } from "@/models/field"
import { apiClient } from "@/networking/ApiClient"
import { useAssetFolders } from "@/networking/hooks/asset"
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
    const { folders, isLoading: isFoldersLoading } = useAssetFolders(params.spaceid, {})
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const router = useRouter()
    const [name, setName] = useState<string>("")
    const toast = useToast()
    const [isSaveLoading, setIsSaveLoading] = useState<boolean>(false)
    const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false)
    const queryClient = useQueryClient()
    const { t }  = usePhrases();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
    useEffect(() => {
        hideMainMenu()
        return () => {
            showMainMenu()
        }
    }, [])
    useEffect(() => {
        if (!folders) return
        const folder = folders.find(f => f.folderId === params.folderid)
        if (!folder) {
            router.back();
            return;
        }
        setName(folder.name)
        setIsLoading(false);
    }, [folders])



    const save = async () => {
        setIsSaveLoading(true)
        try {
            await apiClient.put<PutAssetFolderItemResponse, PutAssetFolderItemRequest>({
                path: `/space/${params.spaceid}/asset/folder/${params.folderid}`,
                body: {
                    name,
                },
                isAuthRequired: true,
            })
            toast({
                title: t("asset_folder_configure_save_success", name), 
                status: "success",
                position: "bottom-right",
            })
            setIsSaveLoading(false)
            queryClient.removeQueries([["asset_folders", params.spaceid]])
            router.replace(`/portal/spaces/${params.spaceid}/asset/folder`)
        } catch (ex) {
            setIsSaveLoading(false)
            toast({
                title: t("asset_folder_configure_save_error_title"),
                description: t("asset_folder_configure_save_error_description"),
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
                                {t("asset_folder_configure_delete_heading")}
                            </ModalHeader>
                            <ModalCloseButton right={10} top={10} />
                            <ModalBody overflow="auto" p={10}>
                                <VStack alignItems={"flex-start"} spacing={5}>
                                    <Box>{t("asset_folder_configure_delete_description1")}</Box>
                                    <Box>{t("asset_folder_configure_delete_description2")}</Box>
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
                                                path: `/space/${params.spaceid}/asset/folder/${params.folderid}`,
                                                isAuthRequired: true,
                                            })
                                            toast({
                                                title: t("asset_folder_configure_delete_success", name),
                                                status: "success",
                                                position: "bottom-right",
                                            })
                                            setIsDeleteLoading(false)
                                            queryClient.removeQueries([["asset_folders", params.spaceid]])
                                            queryClient.removeQueries([["asset", params.spaceid]])
                                            router.replace(`/portal/spaces/${params.spaceid}/asset/folder`)
                                        } catch (ex) {
                                            setIsDeleteLoading(false)
                                            toast({
                                                title: t("asset_folder_configure_delete_error_title"),
                                                description: t("asset_folder_configure_delete_error_description"),
                                                status: "error",
                                                position: "bottom-right",
                                            })
                                        }


                                    }}

                                >
                                    {t("asset_folder_configure_delete_button")}
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => {

                                        onDeleteClose()
                                    }}
                                >
                                    {t("cancel")}
                                </Button>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>





                    <SaveMenuBar
                        positiveText={t("asset_folder_configure_savebar_save")}
                        neutralText={t("asset_folder_configure_savebar_close")}
                        positiveLoading={isSaveLoading}
                        onClose={() => {
                            router.push(`/portal/spaces/${params.spaceid}/asset/folder`)
                        }}
                        onNeutral={() => {
                            router.push(`/portal/spaces/${params.spaceid}/asset/folder`)
                        }}
                        onPositive={async () => {
                            await save()
                        }}
                    >
                        <HStack spacing={2}>
                            <Box as="span">{t("asset_folder_configure_savebar_title")}</Box>
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
                                        <TextInput subject={t("asset_folder_configure_inputs_name_subject")} placeholder={t("asset_folder_configure_inputs_name_placeholder")} value={name} onChange={setName} focus={true}></TextInput>
                                    </GridItem>
                                    <GridItem>
                                        <TextInput subject={t("asset_folder_configure_inputs_folderid_subject")} value={params.folderid} disabled={true} enableCopy={true}></TextInput>
                                    </GridItem>
                                </Grid>


                                <Box w="100%">
                                    <Box mb={5}>{t("asset_folder_configure_dangerzone")}</Box>
                                    <Button leftIcon={<Trash></Trash>} onClick={onDeleteOpen}>{t("asset_folder_configure_dangerzone_button")}</Button>
                                </Box>

                            </VStack>
                        </Container>
                    </Box>
                </>
            )}
        </>)

}
