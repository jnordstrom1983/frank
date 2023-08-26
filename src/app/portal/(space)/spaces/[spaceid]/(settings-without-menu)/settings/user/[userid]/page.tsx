"use client"
import { SaveMenuBar } from "@/components/SaveMenuBar"
import TextInput from "@/components/TextInput"
import { Field } from "@/models/field"
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
import { Trash } from "react-feather"

import { PutSpaceUserItemRequest, PutSpaceUserItemResponse } from "@/app/api/space/[spaceid]/user/[userid]/put"
import { SpaceUserRole } from "@/models/spaceuser"
import { useSpaceUsers } from "@/networking/hooks/spaces"

interface SortableFields extends Field {
    id: string
}
export default function Home({ params }: { params: { spaceid: string; userid: string } }) {
    const { showMainMenu, hideMainMenu } = useAppStore((state) => state)
    const router = useRouter()
    const { users } = useSpaceUsers(params.spaceid, {})
    const [name, setName] = useState<string>("")
    const [role, setRole] = useState<string>("editor")
    const [email, setEmail] = useState<string>("")

    const [isLoading, setIsLoading] = useState(true)
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
        setEmail(user.email)
        setRole(user.role)
        setIsLoading(false)
    }, [users])

    async function save() {
        setIsSaveLoading(true)
        try {
            await apiClient.put<PutSpaceUserItemResponse, PutSpaceUserItemRequest>({
                path: `/space/${params.spaceid}/user/${params.userid}`,
                body: {
                    role: role as SpaceUserRole,
                },
                isAuthRequired: true,
            })
            toast({
                title: `${name} saved.`,
                status: "success",
                position: "bottom-right",
            })
            setIsSaveLoading(false)

            queryClient.invalidateQueries([["space_user", params.spaceid]])
            router.back()
        } catch (ex) {
            setIsSaveLoading(false)
            toast({
                title: "Could not save user",
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
                                Delete user
                            </ModalHeader>
                            <ModalCloseButton right={10} top={10} />
                            <ModalBody overflow="auto" p={10}>
                                <VStack alignItems={"flex-start"} spacing={5}>
                                    <Box>Are you sure you wish to remove this user?</Box>
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
                                                path: `/space/${params.spaceid}/user/${params.userid}`,
                                                isAuthRequired: true,
                                            })
                                            toast({
                                                title: `${name} deleted.`,
                                                status: "success",
                                                position: "bottom-right",
                                            })
                                            setIsDeleteLoading(false)
                                            queryClient.removeQueries([["space_user", params.spaceid]])
                                            router.back()
                                        } catch (ex) {
                                            setIsDeleteLoading(false)
                                            toast({
                                                title: "Could not delete user",
                                                description: "Please try again.",
                                                status: "error",
                                                position: "bottom-right",
                                            })
                                        }
                                    }}
                                >
                                    Delete user
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
                            <Box as="span">Configure user</Box>
                            <Box as="span" fontWeight={"bold"}>
                                {email}
                            </Box>
                        </HStack>
                    </SaveMenuBar>
                    <Box backgroundColor={"#fff"} minH={"100vh"} pt="120px" pb={"50px"}>
                        <Container maxW="1000px">
                            <VStack w="100%" spacing="60px">
                                <HStack spacing={20} w="100%">
                                    <Box w="50%">
                                        <TextInput value={name} subject="Name" disabled={true}></TextInput>
                                    </Box>
                                    <Box w="50%">
                                        <TextInput value={email} subject="E-mail" disabled={true}></TextInput>
                                    </Box>
                                </HStack>

                                <HStack spacing={20} w="100%">
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
                                    <Box w="50%"></Box>
                                </HStack>

                                <Box w="100%">
                                    <Box mb={5}>Danger zone</Box>
                                    <Button leftIcon={<Trash></Trash>} onClick={onDeleteOpen}>
                                        Delete user
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
