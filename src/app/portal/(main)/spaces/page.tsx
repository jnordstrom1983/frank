"use client"
import { Box, Button, Center, Container, Flex, Heading, HStack, Spinner, Table, Tbody, Td, Th, Thead, Tr, useToast, VStack } from "@chakra-ui/react"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import TextInput from "@/components/TextInput"
import { ExternalLink, Inbox, Loader, X } from "react-feather"
import { PostSpaceRequest, PostSpaceResponse } from "@/app/api/space/post"
import { apiClient } from "@/networking/ApiClient"
import { useQueryClient } from "@tanstack/react-query"
import { useSpaces } from "@/networking/hooks/spaces"
import { z } from "zod"
import { languages } from "@/lib/constants"
import { useRouter } from "next/navigation"
import { useProfile } from "@/networking/hooks/user"
export default function Home() {
    const router = useRouter()
    const [mode, setMode] = useState<"list" | "create" | "loading">("loading")
    const [name, setName] = useState<string>("")
    const [language, setLanguage] = useState<string>("en")
    const [createLoading, setCreateLoading] = useState<boolean>(false)
    const [nameValid, setNameValid] = useState<boolean>(false)
    const toast = useToast()
    const queryClient = useQueryClient()
    const { profile } = useProfile()
    const { spaces, isLoading: isSpacesLoading } = useSpaces({ enabled: true })
    const languageOptions = languages.map((l) => ({ key: l.code, text: l.name }))
    useEffect(() => {
        if (!profile) return
        if (!isSpacesLoading && spaces) {
            if (spaces.length > 0) {
                setMode("list")
            } else {
                setMode("create")
            }
        }
    }, [isSpacesLoading, spaces, profile])
    return (
        <>
            {mode == "loading" && (
                <Center h="100vh" w="100%">
                    <Spinner size="xl" colorScheme="blue"></Spinner>
                </Center>
            )}
            {mode == "create" && (
                <Box bg="white" mt="-3px" padding="10">
                    {profile!.role === "user" && (
                        <Container maxW="600px">
                            <HStack spacing="10" padding={10}>
                                <Inbox size="48px"></Inbox>
                                <VStack flex={1} alignItems="flex-start">
                                    <Heading>You do not have access to any spaces yet.</Heading>
                                    <Box color="grey" fontSize="14px">
                                        <VStack w="100%" alignItems="flex-start">
                                            <Box>Your account do not have access to any spaces yet. Please check back later, or talk to your system administrator. </Box>
                                        </VStack>
                                    </Box>
                                </VStack>
                            </HStack>
                        </Container>
                    )}

                    {profile!.role === "admin" && (
                        <Container maxW="800px">
                            {spaces && spaces?.length > 0 && (
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
                            )}

                            <HStack w="100%" spacing="10" alignItems="flex-start">
                                <Box w="50%">
                                    <VStack alignItems="flex-start" spacing="5">
                                        <Heading>Create space</Heading>
                                        <Box color="grey" fontSize="14px">
                                            <Box>A space is where you store all the content.</Box>
                                            <Box mt="5">
                                                {" "}
                                                You can see a space as a container and that you should use one space per specific use case, such as one space per project.
                                            </Box>
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
                                            placeholder="My Content Space"
                                            validate={z.string().min(3)}
                                            onValidation={(valid) => {
                                                setNameValid(valid)
                                            }}
                                        ></TextInput>
                                        <TextInput subject="Default language" type="select" value={language} onChange={setLanguage} options={languageOptions}></TextInput>

                                        <Flex justifyContent="flex-end" w="100%">
                                            <Button
                                                colorScheme={"green"}
                                                w="150px"
                                                isLoading={createLoading}
                                                isDisabled={!nameValid || createLoading}
                                                onClick={async () => {
                                                    setCreateLoading(true)
                                                    try {
                                                        const response = await apiClient.post<PostSpaceResponse, PostSpaceRequest>({
                                                            path: "/space",
                                                            isAuthRequired: true,
                                                            body: {
                                                                name,
                                                                //@ts-ignore
                                                                language,
                                                            },
                                                        })
                                                    } catch (ex) {
                                                        setCreateLoading(false)
                                                        toast({
                                                            title: "Could not create space",
                                                            description: "Please try again.",
                                                            status: "error",
                                                            position: "bottom-right",
                                                        })
                                                        return
                                                    }
                                                    setName("")
                                                    setLanguage("en")
                                                    setNameValid(false)
                                                    setCreateLoading(false)
                                                    queryClient.invalidateQueries(["spaces"])
                                                    setMode("list")
                                                }}
                                            >
                                                CREATE
                                            </Button>
                                        </Flex>
                                    </VStack>
                                </Box>
                            </HStack>
                        </Container>
                    )}
                </Box>
            )}

            {mode == "list" && (
                <Container maxW="1000px">
                    <VStack w="100%" spacing="10">
                        <HStack w="100%" mt="20px">
                            <Heading flex={1}>Spaces</Heading>
                            <Button colorScheme={"green"} w="150px" onClick={() => setMode("create")}>
                                CREATE
                            </Button>
                        </HStack>
                        <Box bg="white" padding="10" w="100%">
                            <Table>
                                <Thead>
                                    <Tr>
                                        <Th>NAME</Th>
                                        <Th width="300px">CREATOR</Th>
                                        <Th width="300px"></Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {spaces?.map((s) => (
                                        <Tr
                                            key={s.spaceId}
                                            _hover={{ backgroundColor: "#fafafa", cursor: "pointer" }}
                                            onClick={() => {
                                                router.push(`/portal/spaces/${s.spaceId}/content`)
                                            }}
                                        >
                                            <Td fontWeight="600">{s.name}</Td>
                                            <Td>{s.creatorName}</Td>
                                            <Td textAlign={"right"}>
                                                <Box as="span" color="blue.500">
                                                    Open
                                                </Box>
                                                <Button variant={"ghost"}>
                                                    <ExternalLink size={24} />
                                                </Button>
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </Box>
                    </VStack>
                </Container>
            )}
        </>
    )
}
