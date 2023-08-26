"use client"
import { PostUserRequest, PostUserResponse } from "@/app/api/user/post"
import { Empty } from "@/components/Empty"
import { SelectionList } from "@/components/SelectionList"
import TextInput from "@/components/TextInput"
import { User, UserRole } from "@/models/user"
import { apiClient } from "@/networking/ApiClient"
import { useUsers } from "@/networking/hooks/user"
import { Box, Button, Center, Container, Flex, HStack, Heading, Spinner, Table, Tag, Tbody, Td, Th, Thead, Tr, VStack, useToast } from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Search, X } from "react-feather"
import { z } from "zod"

export default function Home({ params }: { params: {} }) {
    const router = useRouter()
    const [mode, setMode] = useState<"list" | "loading" | "create">("loading")
    const { users } = useUsers({})
    const queryClient = useQueryClient()
    const [filterStatus, setFilterStatus] = useState<string>("active")

    const [filterSearch, setFilterSearch] = useState<string>("")
    const [filterRole, setFilterRole] = useState<string>("")
    const [createRole, setCreateRole] = useState<UserRole>("user")
    const [createName, setCreateName] = useState<string>("")
    const [createEmail, setCreateEmail] = useState<string>("")

    const [createLoading, setCreateLoading] = useState<boolean>(false)

    const [nameValid, setNameValid] = useState<boolean>(true)
    const [emailValid, setEmailValid] = useState<boolean>(true)

    const toast = useToast()

    const [filteredUsers, setFilteredUsers] = useState<User[]>([])

    useEffect(() => {
        if (!users) return
        const filtered = users.filter((item) => {
            if (filterStatus) {
                if (filterStatus === "active" && !item.enabled) return false
                if (filterStatus === "deleted" && item.enabled) return false
            }
            if (filterRole) {
                if (item.role !== filterRole) return false
            }
            if (filterSearch) {
                let searchMatch = false
                if (item.email.toLowerCase().includes(filterSearch.toLowerCase())) searchMatch = true
                if (item.name.toLowerCase().includes(filterSearch.toLowerCase())) searchMatch = true

                if (!searchMatch) return false
            }

            return true
        })


        setFilteredUsers(filtered)
    }, [users, filterStatus, filterSearch, filterRole])

    useEffect(() => {
        if (!users) return
        setMode("list")
    }, [users])

    async function create(name: string, email: string, role: UserRole) {
        setCreateLoading(true)
        try {
            const response = await apiClient.post<PostUserResponse, PostUserRequest>({
                path: `/user`,
                isAuthRequired: true,
                body: {
                    name: createName,
                    email: createEmail,
                    role: createRole,
                },
            })
            setCreateLoading(false)
            queryClient.invalidateQueries([["users"]])
            toast({
                title: "User created",
                status: "success",
                position: "bottom-right",
            })
        } catch (ex: any) {
            setCreateLoading(false)

            if (ex.code === 409) {
                toast({
                    title: "User already exists",
                    status: "warning",
                    position: "bottom-right",
                })

                return
            }
            toast({
                title: "Could not create user",
                description: "Please try again.",
                status: "error",
                position: "bottom-right",
            })
        }
    }

    return (
        <>
            {mode == "loading" && (
                <Center h="100vh" w="100%">
                    <Spinner size="xl" colorScheme="blue"></Spinner>
                </Center>
            )}

            {mode == "create" && (
                <Box bg="white" mt="-3px" padding="10">
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
                                    <Heading>Create a new user</Heading>
                                    <Box color="grey" fontSize="14px">
                                        <Box>Add system wide users here.</Box>
                                        <Box mt="5">If you like to add a user to a specific space, it might be better to manage the user via the space.</Box>
                                    </Box>
                                </VStack>
                            </Box>
                            <Box w="50%">
                                <VStack alignItems="flex-start" spacing="10">
                                    <TextInput
                                        subject="Name"
                                        value={createName}
                                        disabled={createLoading}
                                        focus={true}
                                        onValidation={setNameValid}
                                        onChange={setCreateName}
                                        placeholder="John Doe"
                                        validate={z.string().min(3)}
                                    ></TextInput>

                                    <TextInput
                                        subject="E-mail"
                                        value={createEmail}
                                        disabled={createLoading}
                                        onValidation={setEmailValid}
                                        onChange={setCreateEmail}
                                        validate={z.string().email()}
                                        placeholder="john.doe@example.com"
                                    ></TextInput>

                                    <TextInput
                                        subject="Role"
                                        type="select"
                                        options={[
                                            { text: "Regular user", key: "user" },
                                            { text: "Administrator", key: "admin" },
                                        ]}
                                        value={createRole}
                                        disabled={createLoading}
                                        onChange={(value) => setCreateRole(value as UserRole)}
                                        placeholder="Select role"
                                    ></TextInput>

                                    <Flex justifyContent="flex-end" w="100%">
                                        <Button
                                            colorScheme={"green"}
                                            w="150px"
                                            isLoading={createLoading}
                                            isDisabled={!nameValid || !emailValid || createLoading}
                                            onClick={async () => {
                                                create(createName, createEmail, createRole)
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

            {mode == "list" && (
                <>
                    <Flex style={{ minHeight: "calc(100vh - 78px)" }} flex={1} flexDir={"column"} maxW="1400px">
                        <Flex flex={1} flexDir={"row"}>
                            <Flex bg="#fff" width="250px" p={5}>
                                <VStack spacing={10} alignItems={"flex-start"} w="100%">
                                    <SelectionList
                                        subject="ROLE"
                                        items={[
                                            { id: "user", name: "User" },
                                            { id: "admin", name: "Administrator" },
                                        ]}
                                        selectedItemId={filterRole}
                                        onClick={setFilterRole}
                                        anyText="Any role"
                                    ></SelectionList>

                                    <SelectionList
                                        subject="STATUS"
                                        items={[
                                            { id: "active", name: "Active" },
                                            { id: "deleted", name: "Deleted" },
                                        ]}
                                        selectedItemId={filterStatus}
                                        onClick={setFilterStatus}
                                        anyText="Any status"
                                    ></SelectionList>
                                </VStack>
                            </Flex>
                            <Flex flex={1}>
                                <Box p={10} w="100%" maxW="1400px">
                                    <HStack w="100%" alignItems={"center"} gap={10}>
                                        <Heading>All users</Heading>
                                        <Box flex={1}>
                                            <HStack justifyContent={"flex-start"} gap={3}>
                                                <Search></Search>
                                                <Box w="300px">
                                                    <TextInput
                                                        value=""
                                                        placeholder="Search for user"
                                                        bg="#fff"
                                                        focus={true}
                                                        onChange={setFilterSearch}
                                                        onSubmit={setFilterSearch}
                                                    ></TextInput>
                                                </Box>
                                            </HStack>
                                        </Box>
                                        <Button
                                            colorScheme="green"
                                            width="150px"
                                            onClick={() => {
                                                setMode("create")
                                            }}
                                        >
                                            CREATE
                                        </Button>
                                    </HStack>
                                    <Box pt={5}>
                                        {filteredUsers.length > 0 ? (
                                            <Table w="100%">
                                                <Thead>
                                                    <Tr>
                                                        <Th>E-MAIL</Th>

                                                        <Th>NAME</Th>
                                                        <Th>ROLE</Th>
                                                        <Th>STATUS</Th>
                                                        <Th></Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    {filteredUsers.map((user) => (
                                                        <Tr
                                                            _hover={{ backgroundColor: "#fff", cursor: "pointer" }}
                                                            key={user.userId}
                                                            onClick={() => {
                                                                router.push(`/portal/users/${user.userId}`)
                                                            }}
                                                        >
                                                            <Td fontWeight="600">{user.email}</Td>
                                                            <Td>{user.name}</Td>
                                                            <Td>{user.role === "admin" ? "Administrator" : "User"}</Td>

                                                            <Td>
                                                                {user.enabled ? (
                                                                    <Tag colorScheme="green" ml={5}>
                                                                        ACTIVE
                                                                    </Tag>
                                                                ) : (
                                                                    <Tag colorScheme="red" ml={5}>
                                                                        DELETED
                                                                    </Tag>
                                                                )}
                                                            </Td>
                                                            <Td></Td>
                                                        </Tr>
                                                    ))}
                                                </Tbody>
                                            </Table>
                                        ) : (
                                            <Empty message="No users found."></Empty>
                                        )}
                                    </Box>
                                </Box>
                            </Flex>
                        </Flex>
                    </Flex>
                </>
            )}
        </>
    )
}
