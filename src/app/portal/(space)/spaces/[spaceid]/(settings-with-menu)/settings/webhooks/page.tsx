"use client"
import { PostWebhookRequest, PostWebhookResponse } from "@/app/api/space/[spaceid]/webhook/post"
import { Empty } from "@/components/Empty"
import { SimpleCheckboxInput } from "@/components/SimpleCheckbox"
import TextInput from "@/components/TextInput"
import { WebhookEventsEnum, WebhookEventsEnumSchema } from "@/models/webhook"
import { apiClient } from "@/networking/ApiClient"
import { useWebhooks } from "@/networking/hooks/webhook"
import { useAppStore } from "@/stores/appStore"
import { Box, Button, Center, Container, Flex, HStack, Heading, Spinner, Table, Tbody, Td, Th, Thead, Tr, VStack, useToast } from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Sliders, X } from "react-feather"
import { z } from "zod"

export default function Setting({ params }: { params: { spaceid: string } }) {
    const { webhooks } = useWebhooks(params.spaceid, {})

    const [mode, setMode] = useState<"loading" | "list" | "create">("loading")
    const [url, setUrl] = useState<string>("")
    const [urlValid, setUrlValid] = useState<boolean>(false)

    const [createLoading, setCreateLoading] = useState<boolean>(false)
    const [events, setEvents] = useState<WebhookEventsEnum[]>(Array.from(Object.values(WebhookEventsEnumSchema.Values)))
    const queryClient = useQueryClient()
    const router = useRouter()
    const toast = useToast()

    useEffect(() => {
        if (!webhooks) return
        setMode("list")
    }, [webhooks])

    const { setSettingsMenu } = useAppStore((state) => state)
    useEffect(() => {
        setSettingsMenu("webhooks")
    }, [])

    async function create(email: string) {
        setCreateLoading(true)

        try {
            const response = await apiClient.post<PostWebhookResponse, PostWebhookRequest>({
                path: `/space/${params.spaceid}/webhook`,
                isAuthRequired: true,
                body: {
                    endpoint: url,
                    events,
                },
            })
            queryClient.invalidateQueries([["webhooks", params.spaceid]])
            toast({
                title: "Webhook created",
                status: "success",
                position: "bottom-right",
            })
            setMode("list")
            setEvents(Array.from(Object.values(WebhookEventsEnumSchema.Values)))
            setUrl("")
        } catch (ex) {
            setCreateLoading(false)
            toast({
                title: "Could not create webhook",
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
                                    <Heading>Create a webhook.</Heading>
                                    <Box color="grey" fontSize="14px">
                                        <Box>Webhooks is POST requests that are made to specified endpoints when specified events occurs.</Box>
                                    </Box>
                                </VStack>
                            </Box>
                            <Box w="50%">
                                <VStack alignItems="flex-start" spacing="10">
                                    <TextInput
                                        subject="Endpoint URL"
                                        value={url}
                                        disabled={createLoading}
                                        focus={true}
                                        onChange={setUrl}
                                        placeholder="https://www.charlee.app/webhook"
                                        validate={z.string().url()}
                                        onValidation={(valid) => {
                                            setUrlValid(valid)
                                        }}
                                        onSubmit={(value) => {
                                            create(value)
                                        }}
                                    ></TextInput>

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

                                    <Flex justifyContent="flex-end" w="100%">
                                        <Button
                                            colorScheme={"green"}
                                            w="150px"
                                            isLoading={createLoading}
                                            isDisabled={!urlValid || createLoading}
                                            onClick={async () => {
                                                create(url)
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
                        <Heading flex={1}>Webhooks</Heading>
                        <Button
                            colorScheme="green"
                            minW="150px"
                            onClick={async () => {
                                setMode("create")
                            }}
                        >
                            ADD WEBHOOK
                        </Button>
                    </HStack>
                    {webhooks && (
                        <>
                            {webhooks?.length > 0 ? (
                                <Box bg="#fff" p={10} w="100%">
                                    <Table>
                                        <Thead>
                                            <Tr>
                                                <Th>ENDPOINT</Th>
                                                <Th>STATUS</Th>
                                                <Th></Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {webhooks?.map((s) => (
                                                <Tr
                                                    key={s.webhookId}
                                                    _hover={{ backgroundColor: "#fafafa", cursor: "pointer" }}
                                                    onClick={() => {
                                                        queryClient.removeQueries([["webhookevents", s.webhookId]])
                                                        router.push(`/portal/spaces/${params.spaceid}/settings/webhooks/${s.webhookId}`)
                                                    }}
                                                >
                                                    <Td fontWeight="600" color={s.enabled ? undefined : "gray.400"}>
                                                        {s.endpoint}
                                                    </Td>
                                                    <Td color={s.enabled ? undefined : "gray.400"}>{s.enabled ? "ACTIVE" : "DISABLED"}</Td>

                                                    <Td textAlign={"right"} color={s.enabled ? undefined : "gray.400"}>
                                                        <Button variant={"ghost"}>
                                                            <Sliders size={24} />
                                                        </Button>
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </Box>
                            ) : (
                                <Empty message="No webhooks found"></Empty>
                            )}
                        </>
                    )}
                </VStack>
            )}
        </>
    )
}
