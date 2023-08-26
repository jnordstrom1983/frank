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
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    VStack,
    useDisclosure,
    useToast,
    Table
} from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Trash } from "react-feather"

import { PutWebhookItemRequest, PutWebhookItemResponse } from "@/app/api/space/[spaceid]/webhook/[webhookid]/put"
import { SimpleCheckboxInput } from "@/components/SimpleCheckbox"
import { WebhookEventsEnum, WebhookEventsEnumSchema } from "@/models/webhook"
import { useWebhookEvents, useWebhooks } from "@/networking/hooks/webhook"
import dayjs from "dayjs"

export default function Home({ params }: { params: { spaceid: string; webhookid: string } }) {
    const { showMainMenu, hideMainMenu } = useAppStore((state) => state)
    const router = useRouter()
    const { webhooks } = useWebhooks(params.spaceid, {})
    const { events : webhookEvents } = useWebhookEvents(params.spaceid, params.webhookid, {})
    const [url, setUrl] = useState<string>("")
    const [events, setEvents] = useState<WebhookEventsEnum[]>([])
    const [enabled, setEnabled] = useState<boolean>(true)

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
        if (!webhooks) return
        const webhook = webhooks.find((u) => u.webhookId === params.webhookid)
        if (!webhook) {
            router.back()
            return
        }
        setUrl(webhook.endpoint)
        setEnabled(webhook.enabled)
        setEvents(webhook.events)
        setIsLoading(false)
    }, [webhooks])

    async function save() {
        setIsSaveLoading(true)
        try {
            await apiClient.put<PutWebhookItemResponse, PutWebhookItemRequest>({
                path: `/space/${params.spaceid}/webhook/${params.webhookid}`,
                body: {
                    endpoint: url,
                    events,
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

            queryClient.invalidateQueries([["webhooks", params.spaceid]])
            router.back()
        } catch (ex) {
            setIsSaveLoading(false)
            toast({
                title: "Could not save webhook",
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
                                Delete webhook
                            </ModalHeader>
                            <ModalCloseButton right={10} top={10} />
                            <ModalBody overflow="auto" p={10}>
                                <VStack alignItems={"flex-start"} spacing={5}>
                                    <Box>Are you sure you wish to remove this webhook?</Box>
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
                                                path: `/space/${params.spaceid}/webhook/${params.webhookid}`,
                                                isAuthRequired: true,
                                            })
                                            toast({
                                                title: `${name} deleted.`,
                                                status: "success",
                                                position: "bottom-right",
                                            })
                                            setIsDeleteLoading(false)
                                            queryClient.removeQueries([["webhooks", params.spaceid]])
                                            router.back()
                                        } catch (ex) {
                                            setIsDeleteLoading(false)
                                            toast({
                                                title: "Could not delete webhook",
                                                description: "Please try again.",
                                                status: "error",
                                                position: "bottom-right",
                                            })
                                        }
                                    }}
                                >
                                    Delete webhook
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
                            <Box as="span">Configure webhook</Box>
                        </HStack>
                    </SaveMenuBar>
                    <Box backgroundColor={"#fff"} minH={"100vh"} pt="120px" pb={"50px"}>
                        <Container maxW="1000px">
                            <VStack w="100%" spacing="60px">
                                <TextInput value={url} subject="Endpoint URL" onChange={setUrl}></TextInput>

                                <HStack spacing={20} w="100%" alignItems={"flex-start"}>
                                    <Box w="50%">
                                        <VStack spacing={5} w="100%" alignItems={"flex-start"}>
                                            <Box>Trigger on these events</Box>
                                            <VStack spacing={3} w="100%" alignItems={"flex-start"}>
                                                {Object.values(WebhookEventsEnumSchema.Values).map((c) => (
                                                    <SimpleCheckboxInput
                                                        key={c}
                                                        checked={events.includes(c)}
                                                        description={c}
                                                        onChange={(checked) => {
                                                            if (checked) {
                                                                let newValue: string[] = [...events.filter((s) => s !== c), c]
                                                                setEvents(newValue as WebhookEventsEnum[])
                                                            } else {
                                                                let newValue: string[] = [...events.filter((s) => s !== c)]
                                                                setEvents(newValue as WebhookEventsEnum[])
                                                            }
                                                        }}
                                                    ></SimpleCheckboxInput>
                                                ))}
                                            </VStack>
                                        </VStack>
                                    </Box>
                                    <Box w="50%">
                                        <SimpleCheckboxInput checked={enabled} onChange={setEnabled} subject="Enabled"></SimpleCheckboxInput>
                                    </Box>
                                </HStack>

                                <Box w="100%">
                                    <Box mb={5}>Danger zone</Box>
                                    <Button leftIcon={<Trash></Trash>} onClick={onDeleteOpen}>
                                        Delete webhook
                                    </Button>
                                </Box>


{webhookEvents && webhookEvents.length > 0 &&
                                <Box w="100%">
                                    <Box mb={5}>History</Box>
                                    <Table>
                                        <Thead>
                                            <Tr>
                                        
                                                <Th>CONTENT ID</Th>
                                                <Th>EVENT</Th>
                                                <Th>STATUS</Th>
                                                <Th>DATE</Th>
                                                
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {webhookEvents?.map((s) => (
                                                <Tr
                                                    key={s.webhookEventId}
                                                    _hover={{ backgroundColor: "#fafafa", cursor: "pointer" }}
                                                    onClick={() => {
                                                        queryClient.removeQueries( [["webhookevent", s.webhookEventId]])
                                                        router.push(`/portal/spaces/${params.spaceid}/settings/webhooks/${params.webhookid}/event/${s.webhookEventId}`)
                                                    }}
                                                >
                                      
                                                    <Td fontWeight="600">
                                                        {s.contentId}
                                                    </Td>
                                                    <Td >{s.event}</Td>
                                                    <Td >{s.status}</Td>
                                                    <Td >{dayjs(s.created).format("YYYY-MM-DD HH:mm:ss")}</Td>

                                                
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>                                  
                                </Box>


}

{!webhookEvents &&                 <Center w="100%">
                    <Spinner size="xl" colorScheme="blue"></Spinner>
                </Center>}
                            </VStack>
                        </Container>
                    </Box>
                </>
            )}
        </>
    )
}
