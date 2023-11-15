"use client"
import { PostLinkRequest, PostLinkResponse } from "@/app/api/space/[spaceid]/link/post"
import { PostWebhookRequest, PostWebhookResponse } from "@/app/api/space/[spaceid]/webhook/post"
import { SpaceItem } from "@/app/api/space/get"
import { Empty } from "@/components/Empty"
import { SimpleCheckboxInput } from "@/components/SimpleCheckbox"
import TextInput from "@/components/TextInput"
import { GetIcon } from "@/lib/link"
import { SpaceLinkPlacement, SpaceLinkPlacementEnum, SpaceLinkType, SpaceLinkTypeEnum } from "@/models/space"
import { WebhookEventsEnum, WebhookEventsEnumSchema } from "@/models/webhook"
import { apiClient } from "@/networking/ApiClient"
import { useSpaces } from "@/networking/hooks/spaces"
import { useWebhooks } from "@/networking/hooks/webhook"
import { useAppStore } from "@/stores/appStore"
import { Box, Button, Center, Container, Flex, HStack, Heading, Spinner, Table, Tbody, Td, Th, Thead, Tr, VStack, useToast } from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Sliders, X } from "react-feather"
import { z } from "zod"

export default function Setting({ params }: { params: { spaceid: string } }) {

    const [mode, setMode] = useState<"loading" | "list" | "create">("loading")

    const [name, setName] = useState<string>("");
    const [nameValid, setNameValid] = useState<boolean>(false);

    const [url, setUrl] = useState<string>("");
    const [urlValid, setUrlValid] = useState<boolean>(false);

    const [type, setType] = useState<SpaceLinkType>("external");
    const [placement, setPlacement] = useState<SpaceLinkPlacement>("menu");

    const [createLoading, setCreateLoading] = useState<boolean>(false)

    const queryClient = useQueryClient()
    const router = useRouter()
    const toast = useToast()

    const { spaces } = useSpaces({ enabled: true })

    const { setSettingsMenu } = useAppStore((state) => state)
    useEffect(() => {
        setSettingsMenu("links")
    }, [])


    const [space, setSpace] = useState<SpaceItem>()
    useEffect(() => {
        if (!spaces) return
        setSpace(spaces.find((s) => s.spaceId === params.spaceid))
        if (mode === "loading") setMode("list")
    }, [spaces])



    async function create(email: string) {
        setCreateLoading(true)

        try {
            const response = await apiClient.post<PostLinkResponse, PostLinkRequest>({
                path: `/space/${params.spaceid}/link`,
                isAuthRequired: true,
                body: {
                    name,
                    icon: "link",
                    url,
                    placement,
                    type,
                },
            })
            queryClient.invalidateQueries(["spaces"])
            toast({
                title: "Link created",
                status: "success",
                position: "bottom-right",
            })
            setMode("list")
            setUrl("")
            setName("")
            setPlacement("menu")
            setType("external");

        } catch (ex) {
            setCreateLoading(false)
            toast({
                title: "Could not create link",
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
                                    <Heading>Create a link.</Heading>
                                    <Box color="grey" fontSize="14px">
                                        <Box>Links are buttons to external systems. The links can be opened in new window or be embedded into Frank.</Box>
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
                                        placeholder="My link"
                                        validate={z.string().min(3)}
                                        onValidation={(valid) => {
                                            setNameValid(valid)
                                        }}
                                        onSubmit={(value) => {
                                            create(value)
                                        }}
                                    ></TextInput>

                                    <TextInput
                                        subject="URL"
                                        value={url}
                                        disabled={createLoading}

                                        onChange={setUrl}
                                        placeholder="https://www.frank.se/"
                                        validate={z.string().url()}
                                        onValidation={(valid) => {
                                            setUrlValid(valid)
                                        }}
                                        onSubmit={(value) => {
                                            create(value)
                                        }}
                                    ></TextInput>

                                    <TextInput
                                        subject="Placement"
                                        value={placement}
                                        disabled={createLoading}
                                        onChange={(v) => setPlacement(v as SpaceLinkPlacement)}
                                        type="select"
                                        options={Object.values(SpaceLinkPlacementEnum.Values).map(v => ({ key: v, text: v }))}
                                    ></TextInput>

                                    <TextInput
                                        subject="Type"
                                        value={type}
                                        disabled={createLoading}
                                        onChange={(v) => setType(v as SpaceLinkType)}
                                        type="select"
                                        options={Object.values(SpaceLinkTypeEnum.Values).map(v => ({ key: v, text: v }))}
                                    ></TextInput>


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
                        <Heading flex={1}>Links</Heading>
                        <Button
                            colorScheme="green"
                            minW="150px"
                            onClick={async () => {
                                setMode("create")
                            }}
                        >
                            ADD LINK
                        </Button>
                    </HStack>
                    {space && (
                        <>
                            {space.links.length > 0 ? (
                                <Box bg="#fff" p={10} w="100%">
                                    <Table>
                                        <Thead>
                                            <Tr>
                                         
                                                <Th>NAME</Th>
                                                <Th>PLACEMENT</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {space.links.map((s) => (
                                                <Tr
                                                    key={s.linkId}
                                                    _hover={{ backgroundColor: "#fafafa", cursor: "pointer" }}
                                                    onClick={() => {
                                                        router.push(`/portal/spaces/${params.spaceid}/settings/links/${s.linkId}`)
                                                    }}
                                                >
                                            
                                                    <Td fontWeight="600">
                                                        <HStack w="100%">
                                                        {GetIcon(s.icon)}
                                                        <Box>{s.name}</Box>
                                                        </HStack>
                                              
                                                    </Td>
                                                    <Td fontWeight="600">
                                                        {s.placement}
                                                    </Td>

                                                    <Td textAlign={"right"}>
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
                                <Empty message="No links found"></Empty>
                            )}
                        </>
                    )}
                </VStack>
            )}
        </>
    )
}
