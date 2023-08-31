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
import { Copy, Key, Trash } from "react-feather"

import { CopyToClipboard } from "react-copy-to-clipboard"

import { GetAccesskeyItemResponse } from "@/app/api/space/[spaceid]/accesskey/[keyid]/get"
import { PutAccesskeyItemRequest, PutAccesskeyItemResponse } from "@/app/api/space/[spaceid]/accesskey/[keyid]/put"
import { CheckboxInput } from "@/components/CheckboxInput"
import { SimpleCheckboxInput } from "@/components/SimpleCheckbox"
import { useContentypes } from "@/networking/hooks/contenttypes"
import { useSpaceAccesskeys } from "@/networking/hooks/spaces"
import { z } from "zod"

export default function Home({ params }: { params: { spaceid: string; keyid: string } }) {
    const { showMainMenu, hideMainMenu } = useAppStore((state) => state)
    const router = useRouter()
    const { keys } = useSpaceAccesskeys(params.spaceid, {})
    const [name, setName] = useState<string>("")
    const [key, setKey] = useState<string>("")
    const [allContent, setAllContent] = useState<boolean>(false)
    const [drafts, setDrafts] = useState<boolean>(false)
    const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([])
    const { contenttypes } = useContentypes(params.spaceid, {})
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
        if (!keys) return
        if (!contenttypes) return
        const key = keys.find((u) => u.keyId === params.keyid)
        if (!key) {
            router.back()
            return
        }
        setName(key.name)
        setAllContent(key.allContent)
        setSelectedContentTypes(key.contentTypes)
        setDrafts(key.drafts)

        setIsLoading(false)
    }, [keys, contenttypes])

    async function save() {
        setIsSaveLoading(true)
        try {
            await apiClient.put<PutAccesskeyItemResponse, PutAccesskeyItemRequest>({
                path: `/space/${params.spaceid}/accesskey/${params.keyid}`,
                body: {
                    name,
                    allContent,
                    contentTypes: selectedContentTypes,
                    drafts,
                },
                isAuthRequired: true,
            })
            toast({
                title: `${name} saved.`,
                status: "success",
                position: "bottom-right",
            })
            setIsSaveLoading(false)

            queryClient.invalidateQueries([["space_keys", params.spaceid]])
            router.back()
        } catch (ex) {
            setIsSaveLoading(false)
            toast({
                title: "Could not save access key",
                description: "Please try again.",
                status: "error",
                position: "bottom-right",
            })
        }
    }

    async function loadKey() {
        setIsGetLoading(true)
        try {
            const result = await apiClient.get<GetAccesskeyItemResponse>({
                path: `/space/${params.spaceid}/accesskey/${params.keyid}`,

                isAuthRequired: true,
            })

            setKey(result.key)
            setIsGetLoading(false)
        } catch (ex) {
            setIsGetLoading(false)
            toast({
                title: "Could not get access key",
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
                                Delete access key
                            </ModalHeader>
                            <ModalCloseButton right={10} top={10} />
                            <ModalBody overflow="auto" p={10}>
                                <VStack alignItems={"flex-start"} spacing={5}>
                                    <Box>Are you sure you wish to remove this access key?</Box>
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
                                                path: `/space/${params.spaceid}/accesskey/${params.keyid}`,
                                                isAuthRequired: true,
                                            })
                                            toast({
                                                title: `${name} deleted.`,
                                                status: "success",
                                                position: "bottom-right",
                                            })
                                            setIsDeleteLoading(false)
                                            queryClient.removeQueries([["space_keys", params.spaceid]])
                                            router.back()
                                        } catch (ex) {
                                            setIsDeleteLoading(false)
                                            toast({
                                                title: "Could not delete access key",
                                                description: "Please try again.",
                                                status: "error",
                                                position: "bottom-right",
                                            })
                                        }
                                    }}
                                >
                                    Delete access key
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
                            <Box as="span">Configure access key</Box>
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
                                        <Box mb={5}>Access key</Box>
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
                                                Reveal key
                                            </Button>
                                        )}
                                    </Box>
                                </HStack>

                                <HStack spacing={20} w="100%" alignItems={"flex-start"}>
                                    <Box w="50%">
                                        <CheckboxInput
                                            subject="Scope"
                                            align="top"
                                            checked={allContent}
                                            onChange={setAllContent}
                                            uncheckedBody={
                                                <VStack w="100%" alignItems={"flex-start"}>
                                                    <Box w="100%">This access key does only have access to these contet types.</Box>
                                                    <Table>
                                                        <Thead>
                                                            <Tr>
                                                                <Th>Content type</Th>
                                                            </Tr>
                                                        </Thead>
                                                        <Tbody>
                                                            {contenttypes!.map((c) => {
                                                                return (
                                                                    <Tr key={c.contentTypeId}>
                                                                        <Td>
                                                                            <SimpleCheckboxInput
                                                                                checked={selectedContentTypes.includes(c.contentTypeId)}
                                                                                description={c.name}
                                                                                onChange={(checked) => {
                                                                                    let newItems = [...selectedContentTypes]
                                                                                    if (checked) {
                                                                                        if (!newItems.includes(c.contentTypeId)) {
                                                                                            newItems.push(c.contentTypeId)
                                                                                        }
                                                                                    } else {
                                                                                        if (newItems.includes(c.contentTypeId)) {
                                                                                            newItems = newItems.filter((n) => n !== c.contentTypeId)
                                                                                        }
                                                                                    }
                                                                                    setSelectedContentTypes(newItems)
                                                                                }}
                                                                            ></SimpleCheckboxInput>
                                                                        </Td>
                                                                    </Tr>
                                                                )
                                                            })}
                                                        </Tbody>
                                                    </Table>
                                                </VStack>
                                            }
                                            checkedBody={<>Access to all content</>}
                                        ></CheckboxInput>
                                    </Box>
                                    <Box w="50%">
                                        <CheckboxInput
                                            subject="Access drafts"
                                            align="top"
                                            checked={drafts}
                                            onChange={setDrafts}
                                            uncheckedBody={<Box>No this key can't access drafts</Box>}
                                            checkedBody={<>Drafts can be fetched with this key</>}
                                        ></CheckboxInput>
                                    </Box>
                                </HStack>

                                <Box w="100%">
                                    <Box mb={5}>Danger zone</Box>

                                    <Button leftIcon={<Trash></Trash>} onClick={onDeleteOpen}>
                                        Delete access key
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
