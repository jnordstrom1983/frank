"use client"
import { PutAssetFolderItemResponse, PutAssetFolderItemRequest } from "@/app/api/space/[spaceid]/asset/folder/[folderid]/put"
import { PutAssetItemRequest, PutAssetItemResponse } from "@/app/api/space/[spaceid]/asset/[assetid]/put"
import { PutContentTypeItemRequest, PutContentTypeItemResponse } from "@/app/api/space/[spaceid]/contenttype/[contenttypeid]/put"
import { PutFolderItemRequest, PutFolderItemResponse } from "@/app/api/space/[spaceid]/folder/[folderid]/put"
import { CheckboxInput } from "@/components/CheckboxInput"
import { Empty } from "@/components/Empty"
import { SaveMenuBar } from "@/components/SaveMenuBar"
import { SimpleCheckboxInput } from "@/components/SimpleCheckbox"
import TextInput from "@/components/TextInput"
import { UploadButton } from "@/components/UploadButton"
import { Field } from "@/models/field"
import { apiClient } from "@/networking/ApiClient"
import { useAsset, useAssetFolders } from "@/networking/hooks/asset"
import { useContent } from "@/networking/hooks/content"
import { useContenttype, useContentypes } from "@/networking/hooks/contenttypes"
import { useFolders } from "@/networking/hooks/folder"
import { useAppStore } from "@/stores/appStore"
import {
    Box,
    Button,
    Center,
    Container,
    Flex,
    Image,
    Grid,
    GridItem,
    HStack,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Spinner,
    Table,
    Tag,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    VStack,
    useDisclosure,
    useToast,
    Divider,
} from "@chakra-ui/react"
import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { AlignJustify, PlusCircle, Sliders, Trash } from "react-feather"
import { ImageEditor } from "@/components/ImageEditor/ImageEditor"
import { Asset } from "@/models/asset"
import { SpaceItem } from "@/app/api/space/get"
import { useSpaces } from "@/networking/hooks/spaces"
import { PostFolderRequest, PostFolderResponse } from "@/app/api/space/[spaceid]/folder/post"
import { z } from "zod"

export default function Home({ params }: { params: { spaceid: string; assetid: string } }) {
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
                title: "Folder created",
                status: "success",
                position: "bottom-right",
            })
        } catch (ex) {
            setCreateFolderLoading(false)
            toast({
                title: "Could not create folder",
                description: "Please try again.",
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
                title: `${name} saved.`,
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
                title: "Could not save asset",
                description: "Please try again.",
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
                                Create folder
                            </ModalHeader>
                            <ModalCloseButton right={10} top={10} />
                            <ModalBody overflow="auto" p={10}>
                                <VStack alignItems={"flex-start"} spacing={5}>
                                    <TextInput
                                        subject="Name"
                                        value={createFolderName}
                                        disabled={createFolderLoading}
                                        focus={true}
                                        onChange={setCreateFolderName}
                                        placeholder="My folder"
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
                                    Create
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        onCreateFolderClose()
                                    }}
                                >
                                    Cancel
                                </Button>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>

                    <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered={true}>
                        <ModalOverlay />
                        <ModalContent maxW="600px">
                            <ModalHeader pt={10} px={10} pb={0}>
                                Delete asset
                            </ModalHeader>
                            <ModalCloseButton right={10} top={10} />
                            <ModalBody overflow="auto" p={10}>
                                <VStack alignItems={"flex-start"} spacing={5}>
                                    <Box>Are you sure you wish to remove this asset?</Box>
                                    <Box>If this asset is used by content the asset will not be available anymore. Consider disabling the asset instead of deleting it.</Box>
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
                                                title: `${name} deleted.`,
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
                                                title: "Could not delete asset",
                                                description: "Please try again.",
                                                status: "error",
                                                position: "bottom-right",
                                            })
                                        }
                                    }}
                                >
                                    Delete asset
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
                            <Box as="span">Configure asset</Box>
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
                                        <TextInput subject="Name" placeholder="My asset Type" value={name} onChange={setName} focus={true}></TextInput>
                                    </GridItem>
                                    <GridItem>
                                        <TextInput subject="assetId" value={params.assetid} disabled={true}></TextInput>
                                    </GridItem>
                                </Grid>
                                <Grid templateColumns="3fr 2fr" rowGap="60px" columnGap={20} w="100%">
                                    <GridItem>
                                        <VStack w="100%" alignItems="flex-start" spacing={"60px"}>
                                            <TextInput
                                                subject="Description"
                                                type="textarea"
                                                placeholder="My asset description "
                                                value={description}
                                                onChange={setDescription}
                                            ></TextInput>
                                            <TextInput
                                                subject={
                                                    <HStack>
                                                        <Box fontWeight="bold">Folder</Box>
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
                                                options={[{ key: "", text: "No folder" }, ...(folders || []).map((f) => ({ key: f.folderId, text: f.name }))]}
                                            ></TextInput>
                                            <SimpleCheckboxInput
                                                checked={enabled}
                                                onChange={setEnabled}
                                                subject="Enabled"
                                                description="Asset can be assigned to new content"
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
                                                            <Box>File</Box>
                                                            <Box>
                                                                <a href={url} target="_blank">
                                                                    {filename}{" "}
                                                                </a>
                                                            </Box>
                                                        </Box>
                                                    )}
                                                    {asset.type === "image" && (
                                                        <Box>
                                                            <Box>Image</Box>
                                                            <Box borderRadius={"3px"} overflow="hidden">
                                                                <Image src={url} w="100%"></Image>
                                                            </Box>
                                                        </Box>
                                                    )}
                                                    {asset.type === "image" && (
                                                        <HStack>
                                                            <UploadButton
                                                                positiveImageButtonText="Replace image"
                                                                type={asset.type === "image" ? "image" : "file"}
                                                                assetId={asset.assetId}
                                                                colorScheme="blue"
                                                                text={`REPLACE ${asset.type === "image" ? "IMAGE" : "FILE"}`}
                                                                spaceId={params.spaceid}
                                                                onUploaded={(asset) => {
                                                                    setFilename(asset.filename)
                                                                    setUrl(asset.url)
                                                                }}
                                                            ></UploadButton>

                                                            <EditButton></EditButton>
                                                        </HStack>
                                                    )}
                                                </VStack>
                                            </Box>
                                            {asset.usedBy.length > 0 && (
                                                <VStack w="100%" alignItems="flex-start">
                                                    <Box>Asset is used by...</Box>

                                                    <Table>
                                                        <Thead>
                                                            <Tr>
                                                                <Th px="0">Page</Th>
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
                                    <Box mb={5}>Danger zone</Box>
                                    <Button leftIcon={<Trash></Trash>} onClick={onDeleteOpen}>
                                        Delete asset
                                    </Button>
                                </Box>
                            </VStack>
                        </Container>
                    </Box>
                </>
            )}
        </>
    )

    function EditButton({}) {
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
                                Save
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setImageEditorOpen(false)
                                }}
                            >
                                Cancel
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
                        setImagePreviewUrl(`/api/space/${params.spaceid}/asset/${params.assetid}/image?token=${localStorage.getItem("CHARLEE_AUTH_TOKEN")}`)
                        setImageEditorOpen(true)
                    }}
                >
                    EDIT
                </Button>
            </>
        )
    }
}
