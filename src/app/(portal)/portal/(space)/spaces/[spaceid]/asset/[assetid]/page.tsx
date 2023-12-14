"use client"
import { PutAssetItemRequest, PutAssetItemResponse } from "@/app/api/space/[spaceid]/asset/[assetid]/put"
import { PostFolderRequest, PostFolderResponse } from "@/app/api/space/[spaceid]/folder/post"
import { SpaceItem } from "@/app/api/space/get"
import { ImageEditor } from "@/components/ImageEditor/ImageEditor"
import { SaveMenuBar } from "@/components/SaveMenuBar"
import { SimpleCheckboxInput } from "@/components/SimpleCheckbox"
import TextInput from "@/components/TextInput"
import { UploadButton } from "@/components/UploadButton"
import { usePhrases } from "@/lib/lang"
import { apiClient } from "@/networking/ApiClient"
import { useAsset, useAssetFolders } from "@/networking/hooks/asset"
import { useContent } from "@/networking/hooks/content"
import { useSpaces } from "@/networking/hooks/spaces"
import { useAppStore } from "@/stores/appStore"
import {
    Box,
    Button,
    Center,
    Container,
    Grid,
    GridItem,
    HStack,
    Image,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Spinner,
    Table,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    VStack,
    useDisclosure,
    useToast
} from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { PlusCircle, Trash } from "react-feather"
import { z } from "zod"

export default function Home({ params }: { params: { spaceid: string; assetid: string } }) {
    const { t } = usePhrases();
    const { showMainMenu, hideMainMenu } = useAppStore((state) => state)
    const { asset } = useAsset(params.spaceid, params.assetid, {})
    const { items } = useContent(params.spaceid, {})
    const { folders } = useAssetFolders(params.spaceid, {})
    const { spaces, isLoading: isSpacesLoading } = useSpaces({})
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const router = useRouter()
    const [name, setName] = useState<string>("")
    const [description, setDescription] = useState<string>("")
    const [enabled, setEnabled] = useState<boolean>(true)
    const [url, setUrl] = useState<string>("")
    const [filename, setFilename] = useState<string>("")
    const [folder, setFolder] = useState<string>("")
    const toast = useToast()
    const [isSaveLoading, setIsSaveLoading] = useState<boolean>(false)
    const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false)
    const queryClient = useQueryClient()
    const [space, setSpace] = useState<SpaceItem>()
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
    const { isOpen: isCreateFolderOpen, onOpen: onCreateFolderOpen, onClose: onCreateFolderClose } = useDisclosure()
    const [createFolderName, setCreateFolderName] = useState<string>("")
    const [createFolderLoading, setCreateFolderLoading] = useState<boolean>(false)
    const [createFolderValid, setCreateFolderValid] = useState<boolean>(false)

    async function createFolder() {
        setCreateFolderLoading(true)
        try {
            const response = await apiClient.post<PostFolderResponse, PostFolderRequest>({
                path: `/space/${params.spaceid}/asset/folder`,
                isAuthRequired: true,
                body: {
                    name: createFolderName,
                },
            })

            queryClient.invalidateQueries([["asset_folders", params.spaceid]])
            setCreateFolderLoading(false)
            onCreateFolderClose()
            setFolder(response.folderId)
            toast({
                title: t("asset_configure_createfolder_success"),
                status: "success",
                position: "bottom-right",
            })
        } catch (ex) {
            setCreateFolderLoading(false)
            toast({
                title: t("asset_configure_createfolder_error_title"),
                description: t("asset_configure_createfolder_error_description"),
                status: "error",
                position: "bottom-right",
            })
            return
        }
    }

    useEffect(() => {
        hideMainMenu()
        return () => {
            showMainMenu()
        }
    }, [])
    useEffect(() => {
        if (!asset) return
        if (!items) return
        if (!spaces) return

        setName(asset.name)
        setDescription(asset.description)
        setEnabled(asset.status === "enabled")
        setFolder(asset.assetFolderId || "")
        setUrl(asset.url)
        setFilename(asset.filename)

        const space = spaces.find((p) => p.spaceId === params.spaceid)
        if (!space) {
            throw "Space not found"
        }
        setSpace(space)

        setIsLoading(false)
    }, [asset, spaces, items])

    const save = async () => {
        setIsSaveLoading(true)
        try {
            await apiClient.put<PutAssetItemResponse, PutAssetItemRequest>({
                path: `/space/${params.spaceid}/asset/${params.assetid}`,
                body: {
                    name,
                    description,
                    status: enabled ? "enabled" : "disabled",
                    folder,
                },
                isAuthRequired: true,
            })
            toast({
                title: t("asset_configure_save_success", name),
                status: "success",
                position: "bottom-right",
            })
            setIsSaveLoading(false)
            queryClient.removeQueries([["assetitem", params.assetid]])
            queryClient.removeQueries([["asset", params.spaceid]])
            router.replace(`/portal/spaces/${params.spaceid}/asset`)
        } catch (ex) {
            setIsSaveLoading(false)
            toast({
                title: t("asset_configure_save_error_title"),
                description: t("asset_configure_save_error_description"),
                status: "error",
                position: "bottom-right",
            })
        }
    }

    return (
        <>
            {isLoading || !asset ? (
                <Center h="100vh" w="100%">
                    <Spinner size="xl" colorScheme="blue"></Spinner>
                </Center>
            ) : (
                <>
                    <Modal isOpen={isCreateFolderOpen} onClose={onCreateFolderClose} isCentered={true}>
                        <ModalOverlay />
                        <ModalContent maxW="600px">
                            <ModalHeader pt={10} px={10} pb={0}>
                                {t("asset_configure_createfolder_heading")}
                            </ModalHeader>
                            <ModalCloseButton right={10} top={10} />
                            <ModalBody overflow="auto" p={10}>
                                <VStack alignItems={"flex-start"} spacing={5}>
                                    <TextInput
                                        subject={t("asset_configure_createfolder_input_subject")}
                                        value={createFolderName}
                                        disabled={createFolderLoading}
                                        focus={true}
                                        onChange={setCreateFolderName}
                                        placeholder={t("asset_configure_createfolder_input_placeholder")}
                                        validate={z.string().min(3)}
                                        onValidation={(valid) => {
                                            setCreateFolderValid(valid)
                                        }}
                                        onSubmit={createFolder}
                                    ></TextInput>
                                </VStack>
                            </ModalBody>

                            <ModalFooter pb={10} px={10} gap={10}>
                                <Button
                                    isLoading={createFolderLoading}
                                    isDisabled={createFolderLoading || !createFolderValid}
                                    colorScheme="green"
                                    mr={3}
                                    minW="150px"
                                    onClick={async () => {
                                        createFolder()
                                    }}
                                >
                                    {t("asset_configure_createfolder_button")}
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        onCreateFolderClose()
                                    }}
                                >
                                    {t("cancel")}
                                </Button>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>

                    <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered={true}>
                        <ModalOverlay />
                        <ModalContent maxW="600px">
                            <ModalHeader pt={10} px={10} pb={0}>
                                {(t("asset_configure_deletet_heading"))}
                            </ModalHeader>
                            <ModalCloseButton right={10} top={10} />
                            <ModalBody overflow="auto" p={10}>
                                <VStack alignItems={"flex-start"} spacing={5}>
                                    <Box>{t("asset_configure_deletet_description1")}</Box>
                                    <Box>{t("asset_configure_deletet_description2")}</Box>
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
                                                path: `/space/${params.spaceid}/asset/${params.assetid}`,
                                                isAuthRequired: true,
                                            })
                                            toast({
                                                title: t("asset_configure_deletet_success", name),
                                                status: "success",
                                                position: "bottom-right",
                                            })
                                            setIsDeleteLoading(false)
                                            queryClient.removeQueries([["assetitem", params.assetid]])
                                            queryClient.removeQueries([["asset", params.spaceid]])
                                            router.replace(`/portal/spaces/${params.spaceid}/asset`)
                                        } catch (ex) {
                                            setIsDeleteLoading(false)
                                            toast({
                                                title: t("asset_configure_deletet_error_title"),
                                                description: t("asset_configure_deletet_error_description"),
                                                status: "error",
                                                position: "bottom-right",
                                            })
                                        }
                                    }}
                                >
                                    {t("asset_configure_deletet_button")}
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
                        positiveText={t("asset_configure_savebar_save")}
                        neutralText={t("asset_configure_savebar_close")}
                        positiveLoading={isSaveLoading}
                        onClose={() => {
                            router.push(`/portal/spaces/${params.spaceid}/asset`)
                        }}
                        onNeutral={() => {
                            router.push(`/portal/spaces/${params.spaceid}/asset`)
                        }}
                        onPositive={async () => {
                            await save()
                        }}
                    >
                        <HStack spacing={2}>
                            <Box as="span">{t("asset_configure_savebar_title")}</Box>
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
                                        <TextInput subject={t("asset_configure_input_name_subject")} placeholder={t("asset_configure_input_name_placeholder")} value={name} onChange={setName} focus={true}></TextInput>
                                    </GridItem>
                                    <GridItem>
                                        <TextInput subject={t("asset_configure_input_assetId_subject")} value={params.assetid} disabled={true} enableCopy={true}></TextInput>
                                    </GridItem>
                                </Grid>
                                <Grid templateColumns="3fr 2fr" rowGap="60px" columnGap={20} w="100%">
                                    <GridItem>
                                        <VStack w="100%" alignItems="flex-start" spacing={"60px"}>
                                            <TextInput
                                                subject={t("asset_configure_input_description_subject")}
                                                type="textarea"
                                                placeholder={t("asset_configure_input_description_placeholder")}
                                                value={description}
                                                onChange={setDescription}
                                            ></TextInput>
                                            <TextInput
                                                subject={
                                                    <HStack>
                                                        <Box fontWeight="bold">{t("asset_configure_input_folder_subject")}</Box>
                                                        {space!.role === "owner" && (
                                                            <Button
                                                                variant={"ghost"}
                                                                onClick={() => {
                                                                    setCreateFolderName("")
                                                                    setCreateFolderValid(false)
                                                                    onCreateFolderOpen()
                                                                }}
                                                            >
                                                                <PlusCircle></PlusCircle>
                                                            </Button>
                                                        )}
                                                    </HStack>
                                                }
                                                type="select"
                                                value={folder}
                                                onChange={setFolder}
                                                options={[{ key: "", text: t("asset_configure_input_folder_nofolder") }, ...(folders || []).map((f) => ({ key: f.folderId, text: f.name }))]}
                                            ></TextInput>
                                            <SimpleCheckboxInput
                                                checked={enabled}
                                                onChange={setEnabled}
                                                subject={t("asset_configure_input_enabled_subject")}
                                                description={t("asset_configure_input_enabled_description")}
                                            ></SimpleCheckboxInput>
                                        </VStack>
                                    </GridItem>
                                    <GridItem>
                                        <VStack w="100%" alignItems="flex-start" spacing={"60px"}>
                                            <TextInput subject="type" value={asset.type} disabled={true}></TextInput>
                                            <Box w="100%">
                                                <VStack w="100%" alignItems="flex-start">
                                                    {asset.type === "file" && (
                                                        <Box>
                                                            <Box>{t("asset_configure_input_file_subject")}</Box>
                                                            <Box>
                                                                <a href={url} target="_blank">
                                                                    {filename}{" "}
                                                                </a>
                                                            </Box>
                                                        </Box>
                                                    )}
                                                    {asset.type === "image" && (
                                                        <Box>
                                                            <Box>{t("asset_configure_input_image_subject")}</Box>
                                                            <Box borderRadius={"3px"} overflow="hidden">
                                                                <Image src={url} w="100%"></Image>
                                                            </Box>
                                                        </Box>
                                                    )}
                                                 
                                                        <HStack>
                                                            <UploadButton
                                                                positiveImageButtonText={`${asset.type === "image" ? t("asset_configure_upload_image_small") : t("asset_configure_upload_file_small") }`}
                                                                type={asset.type === "image" ? "image" : "file"}
                                                                assetId={asset.assetId}
                                                                colorScheme="blue"
                                                                text={`${asset.type === "image" ? t("asset_configure_upload_image") : t("asset_configure_upload_file")}`}
                                                                spaceId={params.spaceid}
                                                                onUploaded={(asset) => {
                                                                    setFilename(asset.filename)
                                                                    setUrl(asset.url)
                                                                }}
                                                            ></UploadButton>

                                                             {asset.type === "image" && asset.ext !== "svg" && (  <EditButton></EditButton>)}
                                                        </HStack>
                                                    
                                                </VStack>
                                            </Box>
                                            {asset.usedBy.length > 0 && (
                                                <VStack w="100%" alignItems="flex-start">
                                                    <Box>{t("asset_configure_usage")}</Box>

                                                    <Table>
                                                        <Thead>
                                                            <Tr>
                                                                <Th px="0">{t("asset_configure_usage_content")}</Th>
                                                            </Tr>
                                                        </Thead>
                                                        <Tbody>
                                                            {asset.usedBy.map((u) => {
                                                                let item = items?.find((p) => p.contentId === u)
                                                                if (!item) return null
                                                                return (
                                                                    <Tr key={u}>
                                                                        <Td px="0">
                                                                            <a href={`/portal/spaces/${asset.spaceId}/content/${item!.contentId}`}>{item.title}</a>
                                                                        </Td>
                                                                    </Tr>
                                                                )
                                                            })}
                                                        </Tbody>
                                                    </Table>
                                                </VStack>
                                            )}
                                        </VStack>
                                    </GridItem>
                                </Grid>

                                <Box w="100%">
                                    <Box mb={5}>{t("asset_configure_dangerzone")}</Box>
                                    <Button leftIcon={<Trash></Trash>} onClick={onDeleteOpen}>
                                        {t("asset_configure_dangerzone_button")}
                                    </Button>
                                </Box>
                            </VStack>
                        </Container>
                    </Box>
                </>
            )}
        </>
    )

    function EditButton({ }) {
        const { t } = usePhrases();
        const [imageEditorOpen, setImageEditorOpen] = useState<boolean>(false)
        const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("")
        const [addingLoading, setAddingLoading] = useState<boolean>(false)
        // setImagePreviewUrl(imageUrl);
        // setImageEditorOpen(true)

        const [rotation, setRotation] = useState<number>()
        const [mirrorX, setMirrorX] = useState<boolean>(false)
        const [mirrorY, setMirrorY] = useState<boolean>(false)
        const [cropX, setCropX] = useState<number>()
        const [cropY, setCropY] = useState<number>()
        const [cropWidth, setCropWidth] = useState<number>()
        const [cropHeight, setCropHeight] = useState<number>()

        return (
            <>
                <Modal
                    isOpen={imageEditorOpen}
                    onClose={() => {
                        setImageEditorOpen(false)
                    }}
                    isCentered={true}
                >
                    <ModalOverlay />
                    <ModalContent w="800px" minW="880px">
                        <ModalBody p={10}>
                            <Box w="800px" minW="800px">
                                <ImageEditor
                                    url={imagePreviewUrl}
                                    onDataChanged={({ rotation, mirrorX, mirrorY, cropX, cropY, cropHeight, cropWidth }) => {
                                        setRotation(rotation)
                                        setMirrorX(mirrorX)
                                        setMirrorY(mirrorY)
                                        setCropX(cropX)
                                        setCropY(cropY)
                                        setCropWidth(cropWidth)
                                        setCropHeight(cropHeight)
                                    }}
                                ></ImageEditor>
                            </Box>
                        </ModalBody>

                        <ModalFooter pb={10} px={10} gap={10}>
                            <Button
                                colorScheme="blue"
                                isLoading={addingLoading}
                                isDisabled={addingLoading}
                                onClick={async () => {
                                    setAddingLoading(true)
                                    const path = `/space/${params.spaceid}/asset/${params.assetid}`
                                    let body: any = {
                                        name,
                                        description,
                                        status: enabled ? "enabled" : "disabled",
                                        folder,
                                        rotation,
                                        mirrorX,
                                        mirrorY,
                                        cropX,
                                        cropY,
                                        cropWidth,
                                        cropHeight,
                                    }

                                    const asset = await apiClient.put<PutAssetItemResponse, PutAssetItemRequest>({
                                        path,
                                        isAuthRequired: true,
                                        body,
                                    })
                                    setAddingLoading(false)
                                    setImageEditorOpen(false)
                                    setUrl(asset.url)
                                }}
                            >
                                {t("asset_configure_edit_save")}
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setImageEditorOpen(false)
                                }}
                            >
                                {t("cancel")}
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                <Button
                    colorScheme="blue"
                    width="150px"
                    isLoading={addingLoading}
                    isDisabled={addingLoading}
                    onClick={() => {
                        setImagePreviewUrl(`/api/space/${params.spaceid}/asset/${params.assetid}/image?token=${localStorage.getItem("FRANK_AUTH_TOKEN")}`)
                        setImageEditorOpen(true)
                    }}
                >
                    {t("asset_configure_edit_button")}
                </Button>
            </>
        )
    }
}
