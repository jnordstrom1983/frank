"use client"
import { PostSpaceApiUserRequest, PostSpaceApiUserResponse } from "@/app/api/space/[spaceid]/user/api/post"
import { Empty } from "@/components/Empty"
import TextInput from "@/components/TextInput"
import { SpaceUserRole } from "@/models/spaceuser"
import { apiClient } from "@/networking/ApiClient"
import { useSpaceApiUsers } from "@/networking/hooks/spaces"
import { useAppStore } from "@/stores/appStore"
import { Box, Button, Center, Container, Flex, HStack, Heading, Spinner, Table, Tbody, Td, Th, Thead, Tr, VStack, useToast } from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Info, Sliders, X } from "react-feather"
import { z } from "zod"

export default function Setting({ params }: { params: { spaceid: string } }) {
    const { users } = useSpaceApiUsers(params.spaceid, {})
    const [mode, setMode] = useState<"loading" | "list" | "create">("loading")
    const [name, setName] = useState<string>("")
    const [nameValid, setNameValid] = useState<boolean>(false)
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
        setSettingsMenu("api")
    }, [])

    async function create(name: string) {
        setCreateLoading(true)

        try {
            const response = await apiClient.post<PostSpaceApiUserResponse, PostSpaceApiUserRequest>({
                path: `/space/${params.spaceid}/user/api`,
                isAuthRequired: true,
                body: {
                    name,
                    role: role as SpaceUserRole,
                },
            })
            queryClient.invalidateQueries([["space_api_user", params.spaceid]])
            toast({
                title: "API key created",
                status: "success",
                position: "bottom-right",
            })
            router.push(`/portal/spaces/${params.spaceid}/settings/user/api/${response.userId}`)
            setMode("list")
        } catch (ex) {
            setCreateLoading(false)
            toast({
                title: "Could not create api key",
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
                    <Container maxW="800px" py="50px">
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
                                    <Heading>Create a API-key.</Heading>
                                    <Box color="grey" fontSize="14px">
                                        <Box>API keys is used to programmaticly perform tasks that can othervise be done from the protal.</Box>
                                        <Box>See documentations about how to use API keys.</Box>
                                    </Box>
                                </VStack>
                            </Box>
                            <Box w="50%">
                                <VStack alignItems="flex-start" spacing="10">
                                    <TextInput
                                        subject="Name"
                                        value={name}
                                        disabled={createLoading}
                                        focus={true}
                                        onChange={setName}
                                        placeholder="My API key"
                                        validate={z.string().min(3)}
                                        onValidation={(valid) => {
                                            setNameValid(valid)
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
                                            isDisabled={!nameValid || createLoading}
                                            onClick={async () => {
                                                create(name)
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
                        <Heading flex={1}>API-Keys</Heading>
                        <Button
                            colorScheme="green"
                            minW="150px"
                            onClick={async () => {
                                setMode("create")
                            }}
                        >
                            ADD KEY
                        </Button>
                    </HStack>
                    <Box>
                        <HStack spacing={3}>
                            <Info></Info>
                            <Box>API keys is used when you access and modify your space programmaticly.</Box>
                        </HStack>
                    </Box>
                    {users!.length || 0 > 0 ? (
                        <Box bg="#fff" p={10} w="100%">
                            <Table>
                                <Thead>
                                    <Tr>
                                        <Th>NAME</Th>
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
                                                router.push(`/portal/spaces/${params.spaceid}/settings/user/api/${s.userId}`)
                                            }}
                                        >
                                            <Td fontWeight="600">{s.name}</Td>
                                            <Td>{s.role === "owner" ? "Admin / Developer" : "Editor"}</Td>

                                            <Td textAlign={"right"}>
                                                <Button variant={"ghost"}>
                                                    <HStack spacing={3}>
                                                        <Box color="blue.500">Manage</Box>

                                                        <Sliders size={24} />
                                                    </HStack>
                                                </Button>
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>{" "}
                        </Box>
                    ) : (
                        <Empty message="No API-keys found"></Empty>
                    )}
                </VStack>
            )}
        </>
    )
}
