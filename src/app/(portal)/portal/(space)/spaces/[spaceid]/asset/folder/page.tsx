"use client"
import TextInput from "@/components/TextInput";
import { apiClient } from "@/networking/ApiClient";
import { useSpaces } from "@/networking/hooks/spaces";
import { Box, Button, Center, Container, Flex, Heading, HStack, Spinner, Table, Tbody, Td, Th, Thead, Tr, useToast, VStack } from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Sliders, X } from "react-feather";
import { z } from "zod";

import { PostFolderRequest, PostFolderResponse } from "@/app/api/space/[spaceid]/folder/post";
import { getAllLangauges, usePhrases } from "@/lib/lang";
import { useAssetFolders } from "@/networking/hooks/asset";
import { useRouter } from "next/navigation";
export default function Home({ params }: { params: { spaceid: string } }) {
    const router = useRouter();
    const [mode, setMode] = useState<"list" | "create" | "loading">("loading")
    const [name, setName] = useState<string>("")
    const [createLoading, setCreateLoading] = useState<boolean>(false)
    const [nameValid, setNameValid] = useState<boolean>(false);
    const toast = useToast()
    const queryClient = useQueryClient()
    const languages = getAllLangauges();
    const { t } = usePhrases();

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
                title: t("asset_folder_create_error_title"),
                description: t("asset_folder_create_error_description"),
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




        {mode == "create" && <Box bg="white" mt="-3px" padding="10" >

            <Container maxW="800px" py="50px">

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
                            <Heading>{t("asset_folder_create_heading")}</Heading>
                            <Box color="grey" fontSize="14px">
                                <Box>
                                    {t("asset_folder_create_description")}
                                </Box>
                            </Box>
                        </VStack>
                    </Box>
                    <Box w="50%">
                        <VStack alignItems="flex-start" spacing="10">
                            <TextInput subject={t("asset_folder_input_subject")} value={name} disabled={createLoading} focus={true} onChange={setName} placeholder={t("asset_folder_input_placeholder")} validate={z.string().min(3)} onValidation={(valid) => {

                                setNameValid(valid)
                            }} onSubmit={(value) => {
                                create(value)
                            }}></TextInput>

                            <Flex justifyContent="flex-end" w="100%">
                                <Button colorScheme={"green"} w="150px" isLoading={createLoading} isDisabled={!nameValid || createLoading} onClick={async () => {
                                    create(name);
                                }}>{t("asset_folder_button")}</Button>
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
                    <Button colorScheme={"green"} w="150px" onClick={() => setMode("create")}>{t("asset_folder_list_create")}</Button>
                </HStack>
                <Box bg="white" padding="10" w="100%">

                    <Table>
                        <Thead>
                            <Tr>
                                <Th>{t("asset_folder_list_table_heading_name")}</Th>
                                <Th>{t("asset_folder_list_table_heading_id")}</Th>
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
                                    <Box as="span" color="blue.500">{t("asset_folder_list_table_configure")}</Box>
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