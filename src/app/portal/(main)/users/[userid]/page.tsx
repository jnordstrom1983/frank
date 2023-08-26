"use client"
import { SaveMenuBar } from "@/components/SaveMenuBar"
import TextInput from "@/components/TextInput"
import { Field } from "@/models/field"
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
    Table,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    VStack,
    useDisclosure,
    useToast,
} from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Trash } from "react-feather"

import { PutUserItemRequest, PutUserItemResponse } from "@/app/api/user/[userid]/put"
import { Empty } from "@/components/Empty"
import { UserRole } from "@/models/user"
import { apiClient } from "@/networking/ApiClient"
import { useUser } from "@/networking/hooks/user"
import { z } from "zod"

interface SortableFields extends Field {
    id: string
}
export default function Home({ params }: { params: { userid: string } }) {
    const { showMainMenu, hideMainMenu } = useAppStore((state) => state)
    const router = useRouter()
    const { user } = useUser(params.userid, {})
    const [name, setName] = useState<string>("")
    const [role, setRole] = useState<string>("editor")
    const [email, setEmail] = useState<string>("")

    const [isLoading, setIsLoading] = useState(true)
    const toast = useToast()
    const [isSaveLoading, setIsSaveLoading] = useState<boolean>(false)
    const queryClient = useQueryClient()
    const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false)
    const [isReEnableLoading, setIsReEnableLoading] = useState<boolean>(false)

    useEffect(() => {
        hideMainMenu()
        return () => {
            showMainMenu()
        }
    }, [])
    useEffect(() => {
        if (!user) return
        setName(user.name)
        setEmail(user.email)
        setRole(user.role)
        setIsLoading(false)
    }, [user])

    async function save(enable?: boolean) {
        setIsSaveLoading(true)
        try {
            const enabled = enable ? true : user!.enabled
            await apiClient.put<PutUserItemResponse, PutUserItemRequest>({
                path: `/user/${params.userid}`,
                body: {
                    name,
                    email,
                    role: role as UserRole,
                    enabled,
                },
                isAuthRequired: true,
            })
            toast({
                title: `${name} saved.`,
                status: "success",
                position: "bottom-right",
            })
            setIsSaveLoading(false)
            queryClient.invalidateQueries([["user", params.userid]])
            queryClient.invalidateQueries([["users"]])

            router.back()
        } catch (ex: any) {
            setIsSaveLoading(false)
            if (ex.code === 409) {
                toast({
                    title: "User with that email already exists",
                    status: "warning",
                    position: "bottom-right",
                })

                return
            }

            toast({
                title: "Could not save user",
                description: "Please validate your data and try again.",
                status: "error",
                position: "bottom-right",
            })
        }
    }

    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
    const { isOpen: isReEnableOpen, onOpen: onReEnableOpen, onClose: onReEnableClose } = useDisclosure()

    return (
        <>
            {isLoading || !user ? (
                <Center h="100vh" w="100%">
                    <Spinner size="xl" colorScheme="blue"></Spinner>
                </Center>
            ) : (
                <>
                    <Modal isOpen={isReEnableOpen} onClose={onReEnableClose} isCentered={true}>
                        <ModalOverlay />
                        <ModalContent maxW="600px">
                            <ModalHeader pt={10} px={10} pb={0}>
                                Restore user
                            </ModalHeader>
                            <ModalCloseButton right={10} top={10} />
                            <ModalBody overflow="auto" p={10}>
                                <VStack alignItems={"flex-start"} spacing={5}>
                                    <Box>Are you sure you wish to restore and re enable this user?</Box>
                                </VStack>
                            </ModalBody>

                            <ModalFooter pb={10} px={10} gap={10}>
                                <Button isLoading={isDeleteLoading} colorScheme="red" mr={3} minW="150px" onClick={() => save(true)}>
                                    Restore user
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        onReEnableClose()
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
                                                path: `/user/${params.userid}`,
                                                isAuthRequired: true,
                                            })
                                            toast({
                                                title: `${name} deleted.`,
                                                status: "success",
                                                position: "bottom-right",
                                            })
                                            setIsDeleteLoading(false)
                                            queryClient.removeQueries([["users"]])
                                            queryClient.removeQueries([["user", params.userid]])
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
                    <Box backgroundColor={"#fff"} minH={"100vh"} pt="40px" pb={"50px"}>
                        <Container maxW="1000px">
                            <VStack w="100%" spacing="60px">
                                <HStack spacing={20} w="100%">
                                    <Box w="50%">
                                        <TextInput value={name} subject="Name" onChange={setName} validate={z.string().min(3)}></TextInput>
                                    </Box>
                                    <Box w="50%">
                                        <TextInput value={email} subject="E-mail" onChange={setEmail} validate={z.string().email()}></TextInput>
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
                                                { key: "admin", text: "Administrator" },
                                                { key: "user", text: "Regular user" },
                                            ]}
                                        ></TextInput>
                                    </Box>
                                    <Box w="50%"></Box>
                                </HStack>

                                <Box w="100%">
                                    <Box mb={5}>Spaces</Box>
                                    {user!.spaces.length > 0 ? (
                                        <Table w="100%">
                                            <Thead>
                                                <Tr>
                                                    <Th>SPACE</Th>

                                                    <Th>ROLE</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {user!.spaces.map((space) => (
                                                    <Tr _hover={{ backgroundColor: "#f7f8fa" }} key={space.spaceId}>
                                                        <Td fontWeight="600">{space.name}</Td>
                                                        <Td>{space.role === "owner" ? "Developer / Owner" : "Editor"}</Td>
                                                    </Tr>
                                                ))}
                                            </Tbody>
                                        </Table>
                                    ) : (
                                        <Empty message="No spaces found."></Empty>
                                    )}
                                </Box>

                                {user!.enabled && (
                                    <Box w="100%">
                                        <Box mb={5}>Danger zone</Box>
                                        <Button leftIcon={<Trash></Trash>} onClick={onDeleteOpen}>
                                            Delete user
                                        </Button>
                                    </Box>
                                )}

                                {!user!.enabled && (
                                    <Box w="100%">
                                        <Box mb={5}>Restore</Box>
                                        <Button leftIcon={<Trash></Trash>} isLoading={isSaveLoading} onClick={onReEnableOpen}>
                                            Restore user
                                        </Button>
                                    </Box>
                                )}
                            </VStack>
                        </Container>
                    </Box>
                </>
            )}
        </>
    )
}
