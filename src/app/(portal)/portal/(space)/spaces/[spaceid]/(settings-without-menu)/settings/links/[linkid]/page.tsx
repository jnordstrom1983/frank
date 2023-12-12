"use client"
import { SaveMenuBar } from "@/components/SaveMenuBar"
import TextInput from "@/components/TextInput"
import { apiClient } from "@/networking/ApiClient"
import { useAppStore } from "@/stores/appStore"
import {
    Box,
    Button,
    Center,
    Container,
    HStack,
    IconButton,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Spinner,
    VStack,
    useDisclosure,
    useToast
} from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Trash } from "react-feather"

import { PutLinkItemResponse, PutLinkkItemRequest } from "@/app/api/space/[spaceid]/link/[linkid]/put"
import { SpaceItem } from "@/app/api/space/get"
import { GetIcon, Icons } from "@/lib/link"
import { SpaceLinkPlacement, SpaceLinkPlacementEnum, SpaceLinkType, SpaceLinkTypeEnum } from "@/models/space"
import { useSpaces } from "@/networking/hooks/spaces"
import { z } from "zod"

export default function Home({ params }: { params: { spaceid: string; linkid: string } }) {
    const { showMainMenu, hideMainMenu } = useAppStore((state) => state)
    const router = useRouter()


    const [isLoading, setIsLoading] = useState(true)
    const toast = useToast()
    const [isSaveLoading, setIsSaveLoading] = useState<boolean>(false)

    const queryClient = useQueryClient()
    const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false)
    const { spaces } = useSpaces({ enabled: true })
    const [space, setSpace] = useState<SpaceItem>()


    const [name, setName] = useState<string>("");
    const [nameValid, setNameValid] = useState<boolean>(false);

    const [url, setUrl] = useState<string>("");
    const [urlValid, setUrlValid] = useState<boolean>(false);

    const [type, setType] = useState<SpaceLinkType>("external");
    const [placement, setPlacement] = useState<SpaceLinkPlacement>("menu");
    const [icon, setIcon] = useState<string>("link")

    const [requiredTag, setRequiredTag] = useState<string>("");



    useEffect(() => {
        hideMainMenu()
        return () => {
            showMainMenu()
        }
    }, [])

    const { setSettingsMenu } = useAppStore((state) => state)
    useEffect(() => {
        setSettingsMenu("links")
    }, [])





    useEffect(() => {
        if (!spaces) return
        const space = spaces.find((s) => s.spaceId === params.spaceid)
        setSpace(space)
        setIsLoading(false)


        const link = space?.links.find((u) => u.linkId === params.linkid)
        if (!link) {
            router.back()
            return
        }

        setName(link.name)
        setUrl(link.url)
        setPlacement(link.placement);
        setType(link.type);
        setIcon(link.icon)
        setRequiredTag(link.requiredTag || "");

        //Set values

        setIsLoading(false)
    }, [spaces])

    async function save() {
        setIsSaveLoading(true)
        try {
            await apiClient.put<PutLinkItemResponse, PutLinkkItemRequest>({
                path: `/space/${params.spaceid}/link/${params.linkid}`,
                body: {
                    name,
                    url,
                    type,
                    placement,
                    icon,
                    requiredTag : !!requiredTag ? requiredTag : undefined
                },
                isAuthRequired: true,
            })
            toast({
                title: `${name} saved.`,
                status: "success",
                position: "bottom-right",
            })
            setIsSaveLoading(false)

            queryClient.invalidateQueries(["spaces"])
            router.back()
        } catch (ex) {
            setIsSaveLoading(false)
            toast({
                title: "Could not save link",
                description: "Please try again.",
                status: "error",
                position: "bottom-right",
            })
        }
    }

    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()

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
                                Delete space
                            </ModalHeader>
                            <ModalCloseButton right={10} top={10} />
                            <ModalBody overflow="auto" p={10}>
                                <VStack alignItems={"flex-start"} spacing={5}>
                                    <Box>Are you sure you wish to remove this space?</Box>
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
                                                path: `/space/${params.spaceid}/link/${params.linkid}`,
                                                isAuthRequired: true,
                                            })
                                            toast({
                                                title: `${name} deleted.`,
                                                status: "success",
                                                position: "bottom-right",
                                            })
                                            setIsDeleteLoading(false)
                                            queryClient.removeQueries(["spaces"])
                                            router.back()
                                        } catch (ex) {
                                            setIsDeleteLoading(false)
                                            toast({
                                                title: "Could not delete link",
                                                description: "Please try again.",
                                                status: "error",
                                                position: "bottom-right",
                                            })
                                        }
                                    }}
                                >
                                    Delete link
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
                            router.back()
                        }}
                        onNeutral={() => {
                            router.back()
                        }}
                        onPositive={async () => {
                            await save()
                        }}
                    >
                        <HStack spacing={2}>
                            <Box as="span">Configure link</Box>
                        </HStack>
                    </SaveMenuBar>
                    <Box backgroundColor={"#fff"} minH={"100vh"} pt="120px" pb={"50px"}>
                        <Container maxW="1000px">
                            <VStack w="100%" spacing="60px">


                                <TextInput
                                    subject="Name"
                                    value={name}
                                    disabled={isSaveLoading}
                                    focus={true}
                                    onChange={setName}
                                    placeholder="My link"
                                    validate={z.string().min(3)}
                                    onValidation={(valid) => {
                                        setNameValid(valid)
                                    }}

                                ></TextInput>

                                <TextInput
                                    subject="URL"
                                    value={url}
                                    disabled={isSaveLoading}

                                    onChange={setUrl}
                                    placeholder="https://www.frank.se/"
                                    validate={z.string().url()}
                                    onValidation={(valid) => {
                                        setUrlValid(valid)
                                    }}

                                ></TextInput>
                                <HStack spacing={10} w="100%">
                                    <TextInput
                                        subject="Placement"
                                        value={placement}
                                        disabled={isSaveLoading}
                                        onChange={(v) => setPlacement(v as SpaceLinkPlacement)}
                                        type="select"
                                        options={Object.values(SpaceLinkPlacementEnum.Values).map(v => ({ key: v, text: v }))}
                                    ></TextInput>

                                    <TextInput
                                        subject="Type"
                                        value={type}
                                        disabled={isSaveLoading}
                                        onChange={(v) => setType(v as SpaceLinkType)}
                                        type="select"
                                        options={Object.values(SpaceLinkTypeEnum.Values).map(v => ({ key: v, text: v }))}
                                    ></TextInput>
                                </HStack>

                                

                                <VStack w="100%" alignItems={"flex-start"}>
                                    <Box>Icon</Box>
                                    <Box gap={5} display={"flex"}>

                                        {Icons.map(i => {
                                            return <IconButton aria-label={i} backgroundColor={icon === i ? "blue.500" : "undefined"} color={icon === i ? "white" : "undefined"} onClick={() => setIcon(i)} icon={GetIcon(i)}></IconButton>
                                        })}



                                    </Box>

                                </VStack>


                                <TextInput
                                    subject="Required tag"
                                    value={requiredTag}
                                    disabled={isSaveLoading}

                                    onChange={setRequiredTag}
                                    placeholder="Set if you like to require a specific tag on the user to show the link"
                                ></TextInput>



                                <Box w="100%">
                                    <Box mb={5}>Danger zone</Box>
                                    <Button leftIcon={<Trash></Trash>} onClick={onDeleteOpen}>
                                        Delete link
                                    </Button>
                                </Box>



                            </VStack>
                        </Container>
                    </Box>
                </>
            )}
        </>
    )
}

