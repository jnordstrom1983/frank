"use client"
import { Box, Button, Center, Container, Flex, Heading, HStack, Spinner, Table, Tbody, Td, Th, Thead, Tr, useToast, VStack } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import Link from 'next/link'
import TextInput from "@/components/TextInput";
import { Inbox, Loader, Sliders, X } from "react-feather"
import { PostSpaceRequest, PostSpaceResponse } from "@/app/api/space/post";
import { apiClient } from "@/networking/ApiClient";
import { useQueryClient } from "@tanstack/react-query";
import { useSpaces } from "@/networking/hooks/spaces";
import { z } from "zod"
import { languages } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useProfile } from "@/networking/hooks/user";
import { useContentypes } from "@/networking/hooks/contenttypes";
import { PostContentTypeRequest, PostContenTypeResponse } from "@/app/api/space/[spaceid]/contenttype/post";
import { useFolders } from "@/networking/hooks/folder";
import { PostFolderRequest, PostFolderResponse } from "@/app/api/space/[spaceid]/folder/post";
import { useAssetFolders } from "@/networking/hooks/asset";
export default function Home({ params }: { params: { spaceid: string } }) {
    const router = useRouter();
    const [mode, setMode] = useState<"list" | "create" | "loading">("loading")
    const [name, setName] = useState<string>("")
    const [createLoading, setCreateLoading] = useState<boolean>(false)
    const [nameValid, setNameValid] = useState<boolean>(false);
    const toast = useToast()
    const queryClient = useQueryClient()

    const { spaces, isLoading: isSpacesLoading } = useSpaces({ enabled: true })
    const { folders, isLoading: isFoldersLoading } = useAssetFolders(params.spaceid, {})

    useEffect(() => {
        if (!spaces) return;
        if (!folders) return;
        if (mode !== "loading") return;

        if (folders.length > 0) {
            setMode("list")
        } else {
            setMode("create")
        }
    }, [folders, spaces, mode])

    async function create(name: string) {
        setCreateLoading(true);
        try {
            const response = await apiClient.post<PostFolderResponse, PostFolderRequest>({
                path: `/space/${params.spaceid}/asset/folder`,
                isAuthRequired: true,
                body: {
                    name,

                },
            })

            queryClient.invalidateQueries([["asset_folders", params.spaceid]]);
            router.push(`/portal/spaces/${params.spaceid}/asset/folder/${response.folderId}`)


        } catch (ex) {
            setCreateLoading(false);
            toast({
                title: "Could not create folder",
                description: "Please try again.",
                status: "error",
                position: "bottom-right"
            })
            return;
        }
    }
    return <>
        {mode == "loading" && <Center h="100vh" w="100%">
            <Spinner size="xl" colorScheme="blue"></Spinner>
        </Center>}




        {mode == "create" && <Box bg="white" mt="-3px" padding="10">

            <Container maxW="800px">

                {folders && folders?.length > 0 &&
                    <Flex justifyContent="flex-end" w="100%">
                        <Button
                            variant={"ghost"}
                            marginTop={-10}
                            onClick={() => {
                                setMode("list");
                            }}
                        >
                            <X size={32} />
                        </Button>
                    </Flex>}

                <HStack w="100%" spacing="10" alignItems="flex-start">
                    <Box w="50%">
                        <VStack alignItems="flex-start" spacing="5">
                            <Heading>Create a folder.</Heading>
                            <Box color="grey" fontSize="14px">
                                <Box>
                                    Folders make it possbile to arrange your assets in different containers.
                                </Box>
                            </Box>
                        </VStack>
                    </Box>
                    <Box w="50%">
                        <VStack alignItems="flex-start" spacing="10">
                            <TextInput subject="Name" value={name} disabled={createLoading} focus={true} onChange={setName} placeholder="My folder" validate={z.string().min(3)} onValidation={(valid) => {

                                setNameValid(valid)
                            }} onSubmit={(value) => {
                                create(value)
                            }}></TextInput>

                            <Flex justifyContent="flex-end" w="100%">
                                <Button colorScheme={"green"} w="150px" isLoading={createLoading} isDisabled={!nameValid || createLoading} onClick={async () => {
                                    create(name);
                                }}>CREATE</Button>
                            </Flex>

                        </VStack>
                    </Box>
                </HStack>
            </Container>


        </Box>}


        {mode == "list" && <Container maxW="1000px">
            <VStack w="100%" spacing="10">
                <HStack w="100%" mt="20px">
                    <Heading flex={1}>Folders</Heading>
                    <Button colorScheme={"blue"} w="150px" onClick={() => router.push(`/portal/spaces/${params.spaceid}/asset`)}>BACK</Button>
                    <Button colorScheme={"green"} w="150px" onClick={() => setMode("create")}>CREATE</Button>
                </HStack>
                <Box bg="white" padding="10" w="100%">

                    <Table>
                        <Thead>
                            <Tr>
                                <Th>NAME</Th>
                                <Th>Id</Th>
                                <Th></Th>
                            </Tr>

                        </Thead>
                        <Tbody>
                            {folders?.map(s => <Tr key={s.folderId} _hover={{ backgroundColor: "#fafafa", cursor: "pointer" }} onClick={() => {
                                router.push(`/portal/spaces/${params.spaceid}/asset/folder/${s.folderId}`)
                            }}>
                                <Td fontWeight="600" >{s.name}</Td>
                                <Td  >{s.folderId}</Td>
                                <Td textAlign={"right"}>
                                    <Box as="span" color="blue.500">Configure</Box>
                                    <Button variant={"ghost"}>
                                        <Sliders size={24} />
                                    </Button>

                                </Td>
                            </Tr>
                            )}
                        </Tbody>
                    </Table>

                </Box>
            </VStack>
        </Container>
        }
    </>
}