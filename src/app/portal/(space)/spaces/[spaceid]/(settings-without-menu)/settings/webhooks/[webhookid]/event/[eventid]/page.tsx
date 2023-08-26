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
    Table,
} from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Trash } from "react-feather"

import { PutWebhookItemRequest, PutWebhookItemResponse } from "@/app/api/space/[spaceid]/webhook/[webhookid]/put"
import { SimpleCheckboxInput } from "@/components/SimpleCheckbox"
import { WebhookEventsEnum, WebhookEventsEnumSchema } from "@/models/webhook"
import { useWebhookEvent, useWebhookEvents, useWebhooks } from "@/networking/hooks/webhook"
import dayjs from "dayjs"

export default function Home({ params }: { params: { spaceid: string; webhookid: string; eventid: string } }) {
    const { showMainMenu, hideMainMenu } = useAppStore((state) => state)
    const router = useRouter()

    const { event } = useWebhookEvent(params.spaceid, params.webhookid, params.eventid, {})

    const [isLoading, setIsLoading] = useState(true)
    const toast = useToast()

    const queryClient = useQueryClient()

    useEffect(() => {
        hideMainMenu()
        return () => {
            showMainMenu()
        }
    }, [])
    useEffect(() => {
        if (!event) return

        setIsLoading(false)
    }, [event])

    return (
        <>
            {isLoading ? (
                <Center h="100vh" w="100%">
                    <Spinner size="xl" colorScheme="blue"></Spinner>
                </Center>
            ) : (
                <>
                    <SaveMenuBar
                        neutralText="CLOSE"
                        onClose={() => {
                            router.back()
                        }}
                        onNeutral={() => {
                            router.back()
                        }}
                    >
                        <HStack spacing={2}>
                            <Box as="span">View event {params.eventid}</Box>
                        </HStack>
                    </SaveMenuBar>
                    {event && (
                        <Box backgroundColor={"#fff"} minH={"100vh"} pt="120px" pb={"50px"}>
                            <Container maxW="1000px">
                                <VStack w="100%" spacing="60px">
                                    <HStack spacing={20} w="100%" alignItems={"flex-start"}>
                                        <TextInput value={event.webhookEventId} subject="EventId" disabled={true}></TextInput>

                                        <TextInput value={dayjs(event.created).format("YYYY-MM-DD HH:mm:ss")} subject="Created" disabled={true}></TextInput>
                                        <TextInput value={event.status} subject="Webhook status" disabled={true}></TextInput>
                                    </HStack>
                                    <HStack spacing={20} w="100%" alignItems={"flex-start"}>
                                        <TextInput value={event.payload.content.contentId} subject="ContentId" disabled={true}></TextInput>
                                        <TextInput value={event.payload.event} subject="Event" disabled={true}></TextInput>
                                    </HStack>
                                    <TextInput value={JSON.stringify(event.payload, null, 3)} subject="Payload" type="textarea" height="300px" disabled={true}></TextInput>

                                    <Box w="100%">
                                        <Box>Requests</Box>
                                        <Table w={"100%"}>
                                            <Thead>
                                                <Tr>
                                            
                                                    <Th>CREATED</Th>
                                                    <Th>STATUS</Th>
                                                    <Th>RESPONSE CODE</Th>
                                                    <Th>RESPONSE BODY</Th>
                                                    
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {event.requests.map((s) => (
                                                    <Tr
                                                        key={s.taskId}
                                                        _hover={{ backgroundColor: "#fafafa", cursor: "pointer" }}
                                                        
                                                    >
                                        
                                                        <Td>
                                                            {dayjs(s.created).format("YYYY-MM-DD HH:mm:ss")}
                                                        </Td>
                                                        <Td >{s.success ? "success" : "error"}</Td>
                                                        <Td >{s.responseCode}</Td>
                                                        <Td maxW="200px">{s.responseText && <RevealText text={s.responseText || ""}></RevealText>}</Td>

                                                    
                                                    </Tr>
                                                ))}
                                            </Tbody>
                                        </Table>  

                                    </Box>



                                </VStack>
                            </Container>
                        </Box>
                    )}
                </>
            )}
        </>
    )
}


function RevealText({text} : { text : string}){
    const [open, setOpen] = useState<boolean>(false);
    if(open){
        return <Box onClick={()=>setOpen(false)}>{text}</Box>
    }else{
        return <Button onClick={()=>setOpen(true)}>Show data</Button>
    }
}