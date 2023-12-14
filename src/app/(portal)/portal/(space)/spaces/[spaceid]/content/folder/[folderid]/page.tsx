"use client"
import { PutFolderItemRequest, PutFolderItemResponse } from "@/app/api/space/[spaceid]/folder/[folderid]/put"
import { CheckboxInput } from "@/components/CheckboxInput"
import { SaveMenuBar } from "@/components/SaveMenuBar"
import { SimpleCheckboxInput } from "@/components/SimpleCheckbox"
import TextInput from "@/components/TextInput"
import { usePhrases } from "@/lib/lang"
import { apiClient } from "@/networking/ApiClient"
import { useContentypes } from "@/networking/hooks/contenttypes"
import { useFolders } from "@/networking/hooks/folder"
import { useAppStore } from "@/stores/appStore"
import { Box, Button, Center, Container, Grid, GridItem, HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, Table, Tbody, Td, Th, Thead, Tr, VStack, useDisclosure, useToast } from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Trash } from "react-feather"


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
    const { t } = usePhrases();
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
                title: t("content_folder_folder_save_success", name),
                status: "success",
                position: "bottom-right",
            })
            setIsSaveLoading(false)
            queryClient.removeQueries([["folders", params.spaceid]])
            router.replace(`/portal/spaces/${params.spaceid}/content/folder`)
        } catch (ex) {
            setIsSaveLoading(false)
            toast({
                title: t("content_folder_folder_save_error_title"),
                description: t("content_folder_folder_save_error_description"),
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
                                {t("content_folder_folder_delete_heading")}
                            </ModalHeader>
                            <ModalCloseButton right={10} top={10} />
                            <ModalBody overflow="auto" p={10}>
                                <VStack alignItems={"flex-start"} spacing={5}>
                                    <Box>{t("content_folder_folder_delete_description1")}</Box>
                                    <Box>{t("content_folder_folder_delete_description2")}</Box>
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
                                                title: t("content_folder_folder_delete_error_title"),
                                                description: t("content_folder_folder_delete_error_description"),
                                                status: "error",
                                                position: "bottom-right",
                                            })
                                        }


                                    }}

                                >
                                    {t("content_folder_folder_delete_button")}
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
                        positiveText={t("content_folder_folder_savebar_save")}
                        neutralText={t("content_folder_folder_savebar_close")}
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
                            <Box as="span">{t("content_folder_folder_savebar_heading")}</Box>
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
                                        <TextInput subject={t("content_folder_folder_input_name_subject")} placeholder={t("content_folder_folder_input_name_placeholder")} value={name} onChange={setName} focus={true}></TextInput>
                                    </GridItem>
                                    <GridItem>
                                        <TextInput subject={t("content_folder_folder_input_contenttype_subject")} value={params.folderid} disabled={true} enableCopy={true}></TextInput>
                                    </GridItem>
                                </Grid>
                                <CheckboxInput checked={limited} align="top" onChange={setLimited} uncheckedBody={<Box>{t("content_folder_folder__limit_unchecked_title")}</Box>} checkedBody={
                                    <VStack w="100%" alignItems={"flex-start"}>
                                        <Box w="100%">{t("content_folder_folder__limit_checked_title")}</Box>
                                        <Table>
                                            <Thead>
                                                <Tr>
                                                    <Th>{t("content_folder_folder__limit_checked_contenttype")}</Th>
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


                                } subject={t("content_folder_folder__limit_titel")}></CheckboxInput>

                                <Box w="100%">
                                    <Box mb={5}>{t("content_folder_folder_dangerzone")}</Box>
                                    <Button leftIcon={<Trash></Trash>} onClick={onDeleteOpen}>{t("content_folder_folder_delete")}</Button>
                                </Box>

                            </VStack>
                        </Container>
                    </Box>
                </>
            )}
        </>)

}
