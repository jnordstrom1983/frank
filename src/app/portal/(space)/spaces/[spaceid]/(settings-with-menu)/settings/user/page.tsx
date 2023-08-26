"use client"
import { PostSpaceUserRequest, PostSpaceUserResponse } from "@/app/api/space/[spaceid]/user/post"
import TextInput from "@/components/TextInput"
import { SpaceUserRole } from "@/models/spaceuser"
import { apiClient } from "@/networking/ApiClient"
import { useSpaceUsers } from "@/networking/hooks/spaces"
import { useAppStore } from "@/stores/appStore"
import { Box, Button, Center, Container, Flex, HStack, Heading, Spinner, Table, Tbody, Td, Th, Thead, Tr, VStack, useToast } from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Sliders, X } from "react-feather"
import { z } from "zod"

export default function Setting({ params }: { params: { spaceid: string } }) {
    const { users } = useSpaceUsers(params.spaceid, {})
    const [mode, setMode] = useState<"loading" | "list" | "create">("loading")
    const [email, setEmail] = useState<string>("")
    const [emailValid, setEmailValid] = useState<boolean>(false)
    const [createLoading, setCreateLoading] = useState<boolean>(false)
    const [role, setRole] = useState<string>("editor")
    const queryClient = useQueryClient()
    const router = useRouter()
    const toast = useToast()
    useEffect(() => {
        if (!users) return
        setMode("list")
    }, [users])

    const { setSettingsMenu } = useAppStore((state) => state)
    useEffect(() => {
        setSettingsMenu("users")
    }, [])

    async function create(email: string) {
        setCreateLoading(true)

        try {
            const response = await apiClient.post<PostSpaceUserResponse, PostSpaceUserRequest>({
                path: `/space/${params.spaceid}/user`,
                isAuthRequired: true,
                body: {
                    email,
                    role: role as SpaceUserRole,
                },
            })
            queryClient.invalidateQueries([["space_user", params.spaceid]])
            toast({
                title: "User created",
                status: "success",
                position: "bottom-right",
            })
            setMode("list")
        } catch (ex) {
            setCreateLoading(false)
            toast({
                title: "Could not create user",
                description: "Please try again.",
                status: "error",
                position: "bottom-right",
            })
            return
        }

        setCreateLoading(false)
    }

    return (
        <>
            {mode === "loading" && (
                <Center w="100%">
                    <Spinner size="xl" colorScheme="blue"></Spinner>
                </Center>
            )}

            {mode == "create" && (
                <Box bg="white" mt="-3px" padding="10" position={"absolute"} left={0} right={0} top={0}>
                    <Container maxW="800px">
                        <Flex justifyContent="flex-end" w="100%">
                            <Button
                                variant={"ghost"}
                                marginTop={-10}
                                onClick={() => {
                                    setMode("list")
                                }}
                            >
                                <X size={32} />
                            </Button>
                        </Flex>

                        <HStack w="100%" spacing="10" alignItems="flex-start">
                            <Box w="50%">
                                <VStack alignItems="flex-start" spacing="5">
                                    <Heading>Create a space user.</Heading>
                                    <Box color="grey" fontSize="14px">
                                        <Box>To add a user to this space, simply add the users email-address and the role you wish to assign the user.</Box>
                                    </Box>
                                </VStack>
                            </Box>
                            <Box w="50%">
                                <VStack alignItems="flex-start" spacing="10">
                                    <TextInput
                                        subject="Email"
                                        value={email}
                                        disabled={createLoading}
                                        focus={true}
                                        onChange={setEmail}
                                        placeholder="john.doe@example.com"
                                        validate={z.string().email().toLowerCase()}
                                        onValidation={(valid) => {
                                            setEmailValid(valid)
                                        }}
                                        onSubmit={(value) => {
                                            create(value)
                                        }}
                                    ></TextInput>
                                    <TextInput
                                        subject="Role"
                                        value={role}
                                        disabled={createLoading}
                                        onChange={setRole}
                                        options={[
                                            { key: "editor", text: "Editor" },
                                            { key: "owner", text: "Administrator / developer" },
                                        ]}
                                        type="select"
                                    ></TextInput>

                                    <Flex justifyContent="flex-end" w="100%">
                                        <Button
                                            colorScheme={"green"}
                                            w="150px"
                                            isLoading={createLoading}
                                            isDisabled={!emailValid || createLoading}
                                            onClick={async () => {
                                                create(email)
                                            }}
                                        >
                                            CREATE
                                        </Button>
                                    </Flex>
                                </VStack>
                            </Box>
                        </HStack>
                    </Container>
                </Box>
            )}

            {mode === "list" && (
                <VStack spacing={10} w="100%" maxW="900px" alignItems={"flex-start"}>
                    <HStack w="100%">
                        <Heading flex={1}>Users</Heading>
                        <Button
                            colorScheme="green"
                            minW="150px"
                            onClick={async () => {
                                setMode("create")
                            }}
                        >
                            ADD USER
                        </Button>
                    </HStack>
                    <Box bg="#fff" p={10} w="100%">
                        <Table>
                            <Thead>
                                <Tr>
                                    <Th>NAME</Th>
                                    <Th>E-MAIL</Th>
                                    <Th>ROLE</Th>
                                    <Th></Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {users?.map((s) => (
                                    <Tr
                                        key={s.userId}
                                        _hover={{ backgroundColor: "#fafafa", cursor: "pointer" }}
                                        onClick={() => {
                                            router.push(`/portal/spaces/${params.spaceid}/settings/user/${s.userId}`)
                                        }}
                                    >
                                        <Td fontWeight="600">{s.name}</Td>
                                        <Td>{s.email}</Td>
                                        <Td>{s.role === "owner" ? "Admin / Developer" : "Editor"}</Td>

                                        <Td textAlign={"right"}>
                                            <Box as="span" color="blue.500">
                                                Manage
                                            </Box>
                                            <Button variant={"ghost"}>
                                                <Sliders size={24} />
                                            </Button>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </Box>
                </VStack>
            )}
        </>
    )
}
