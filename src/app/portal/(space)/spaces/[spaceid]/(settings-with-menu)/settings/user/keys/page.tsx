"use client"
import { PostAccesskeyRequest, PostAccesskeyResponse } from "@/app/api/space/[spaceid]/accesskey/post"
import { Empty } from "@/components/Empty"
import TextInput from "@/components/TextInput"
import { apiClient } from "@/networking/ApiClient"
import { useSpaceAccesskeys, useSpaces } from "@/networking/hooks/spaces"
import { useAppStore } from "@/stores/appStore"
import { Box, Button, Center, Container, Flex, HStack, Heading, Spinner, Table, Tbody, Td, Th, Thead, Tr, VStack, useToast } from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Info, Sliders, X } from "react-feather"
import { z } from "zod"

export default function Setting({ params }: { params: { spaceid: string } }) {
    const { keys } = useSpaceAccesskeys(params.spaceid, {})
    const [mode, setMode] = useState<"loading" | "list" | "create">("loading")
    const [name, setName] = useState<string>("")
    const [nameValid, setNameValid] = useState<boolean>(false)
    const [createLoading, setCreateLoading] = useState<boolean>(false)
    const { spaces } = useSpaces({ enabled: true })
    const space = spaces?.find((p) => p.spaceId === params.spaceid)

    const queryClient = useQueryClient()
    const router = useRouter()
    const toast = useToast()
    useEffect(() => {
        if (!keys) return
        setMode("list")
    }, [keys])

    const { setSettingsMenu } = useAppStore((state) => state)
    useEffect(() => {
        setSettingsMenu("keys")
    }, [])

    async function create(name: string) {
        setCreateLoading(true)

        try {
            const response = await apiClient.post<PostAccesskeyResponse, PostAccesskeyRequest>({
                path: `/space/${params.spaceid}/accesskey`,
                isAuthRequired: true,
                body: {
                    name,
                },
            })
            queryClient.invalidateQueries([["space_keys", params.spaceid]])
            toast({
                title: "Accesskey created",
                status: "success",
                position: "bottom-right",
            })
            router.push(`/portal/spaces/${params.spaceid}/settings/user/keys/${response.keyId}`)
            setMode("list")
        } catch (ex) {
            setCreateLoading(false)
            toast({
                title: "Could not create access key",
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
                                    <Heading>Create a content access key.</Heading>
                                    <Box color="grey" fontSize="14px">
                                        <Box>Content access keys is used to access content via API.</Box>
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
                                        placeholder="My access key"
                                        validate={z.string().min(3)}
                                        onValidation={(valid) => {
                                            setNameValid(valid)
                                        }}
                                        onSubmit={(value) => {
                                            create(value)
                                        }}
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
                        <Heading flex={1}>Content access keys</Heading>
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
                        <VStack spacing={5} alignItems="flex-start">
                            <HStack spacing={3} w="100%">
                                <Info></Info>
                                <Box>Access keys is used when accessing your content via the content api.</Box>
                            </HStack>
                            {space?.contentAccess !== "open" && (
                                <Box color="red.300" fontSize="14px">
                                    This Space is configured with open content access and content access keys is not needed to access your published content. To disable open
                                    content access goto general settings.{" "}
                                </Box>
                            )}
                        </VStack>
                    </Box>

                    {keys!.length || 0 > 0 ? (
                        <Box bg="#fff" p={10} w="100%">
                            <Table>
                                <Thead>
                                    <Tr>
                                        <Th>NAME</Th>
                                        <Th>SCOPE</Th>
                                        <Th></Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {keys?.map((s) => (
                                        <Tr
                                            key={s.keyId}
                                            _hover={{ backgroundColor: "#fafafa", cursor: "pointer" }}
                                            onClick={() => {
                                                router.push(`/portal/spaces/${params.spaceid}/settings/user/keys/${s.keyId}`)
                                            }}
                                        >
                                            <Td fontWeight="600">{s.name}</Td>
                                            <Td>{s.allContent ? "Full access" : "Limited"}</Td>

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
                        <Empty message="No access keys found"></Empty>
                    )}
                </VStack>
            )}
        </>
    )
}
