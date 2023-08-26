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
    useToast,
} from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Copy, Key, Trash } from "react-feather"

import { CopyToClipboard } from "react-copy-to-clipboard"

import { GetSpaceApiUserItemResponse } from "@/app/api/space/[spaceid]/user/api/[userid]/get"
import { PutSpaceApiUserItemRequest, PutSpaceApiUserItemResponse } from "@/app/api/space/[spaceid]/user/api/[userid]/put"
import { SpaceUserRole } from "@/models/spaceuser"
import { useSpaceApiUsers } from "@/networking/hooks/spaces"
import { z } from "zod"

export default function Home({ params }: { params: { spaceid: string; userid: string } }) {
    const { showMainMenu, hideMainMenu } = useAppStore((state) => state)
    const router = useRouter()
    const { users } = useSpaceApiUsers(params.spaceid, {})
    const [name, setName] = useState<string>("")
    const [role, setRole] = useState<string>("editor")
    const [key, setKey] = useState<string>("")

    const [isLoading, setIsLoading] = useState(true)
    const [isGetLoading, setIsGetLoading] = useState<boolean>(false)
    const toast = useToast()
    const [isSaveLoading, setIsSaveLoading] = useState<boolean>(false)
    const queryClient = useQueryClient()
    const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false)

    useEffect(() => {
        hideMainMenu()
        return () => {
            showMainMenu()
        }
    }, [])
    useEffect(() => {
        if (!users) return
        const user = users.find((u) => u.userId === params.userid)
        if (!user) {
            router.back()
            return
        }
        setName(user.name)
        setRole(user.role)
        setIsLoading(false)
    }, [users])

    async function save() {
        setIsSaveLoading(true)
        try {
            await apiClient.put<PutSpaceApiUserItemResponse, PutSpaceApiUserItemRequest>({
                path: `/space/${params.spaceid}/user/api/${params.userid}`,
                body: {
                    role: role as SpaceUserRole,
                    name,
                },
                isAuthRequired: true,
            })
            toast({
                title: `${name} saved.`,
                status: "success",
                position: "bottom-right",
            })
            setIsSaveLoading(false)

            queryClient.invalidateQueries([["space_api_user", params.spaceid]])
            router.back()
        } catch (ex) {
            setIsSaveLoading(false)
            toast({
                title: "Could not save API key",
                description: "Please try again.",
                status: "error",
                position: "bottom-right",
            })
        }
    }

    async function loadKey() {
        setIsGetLoading(true)
        try {
            const result = await apiClient.get<GetSpaceApiUserItemResponse>({
                path: `/space/${params.spaceid}/user/api/${params.userid}`,

                isAuthRequired: true,
            })

            setKey(result.token)
            setIsGetLoading(false)
        } catch (ex) {
            setIsGetLoading(false)
            toast({
                title: "Could not get API key",
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
                                Delete API key
                            </ModalHeader>
                            <ModalCloseButton right={10} top={10} />
                            <ModalBody overflow="auto" p={10}>
                                <VStack alignItems={"flex-start"} spacing={5}>
                                    <Box>Are you sure you wish to remove this API-key?</Box>
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
                                                path: `/space/${params.spaceid}/user/api/${params.userid}`,
                                                isAuthRequired: true,
                                            })
                                            toast({
                                                title: `${name} deleted.`,
                                                status: "success",
                                                position: "bottom-right",
                                            })
                                            setIsDeleteLoading(false)
                                            queryClient.removeQueries([["space_api_user", params.spaceid]])
                                            router.back()
                                        } catch (ex) {
                                            setIsDeleteLoading(false)
                                            toast({
                                                title: "Could not delete API key",
                                                description: "Please try again.",
                                                status: "error",
                                                position: "bottom-right",
                                            })
                                        }
                                    }}
                                >
                                    Delete API key
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
                            <Box as="span">Configure API key</Box>
                            <Box as="span" fontWeight={"bold"}>
                                {name}
                            </Box>
                        </HStack>
                    </SaveMenuBar>
                    <Box backgroundColor={"#fff"} minH={"100vh"} pt="120px" pb={"50px"}>
                        <Container maxW="1000px">
                            <VStack w="100%" spacing="60px">
                                <HStack spacing={20} w="100%">
                                    <Box w="50%">
                                        <TextInput value={name} onChange={setName} validate={z.string().min(3)} subject="Name"></TextInput>
                                    </Box>
                                    <Box w="50%">
                                        <TextInput
                                            value={role}
                                            onChange={setRole}
                                            subject="Role"
                                            type="select"
                                            options={[
                                                { key: "editor", text: "Editor" },
                                                { key: "owner", text: "Administrator / developer" },
                                            ]}
                                        ></TextInput>
                                    </Box>
                                </HStack>

                                <Box w="100%">
                                    <Box mb={5}>API-key</Box>
                                    <HStack></HStack>

                                    {key ? (
                                        <HStack w="100%">
                                            <Box bg="#F5F5F5" borderRadius="25px" p={5} maxW="800px">
                                                {key}
                                            </Box>
                                            <CopyToClipboard
                                                text={key}
                                                onCopy={() =>
                                                    toast({
                                                        title: "Key copied",
                                                        status: "info",
                                                        position: "bottom-right",
                                                    })
                                                }
                                            >
                                                <Button variant={"ghost"} w="60px">
                                                    <Copy></Copy>
                                                </Button>
                                            </CopyToClipboard>
                                        </HStack>
                                    ) : (
                                        <Button leftIcon={<Key></Key>} onClick={loadKey} isLoading={isGetLoading}>
                                            Reveal API key
                                        </Button>
                                    )}
                                </Box>

                                <Box w="100%">
                                    <Box mb={5}>Danger zone</Box>

                                    <Button leftIcon={<Trash></Trash>} onClick={onDeleteOpen}>
                                        Delete API key
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
