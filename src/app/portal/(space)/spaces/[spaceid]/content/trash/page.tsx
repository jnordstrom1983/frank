"use client"
import { DeleteContentTypeItemResponse } from "@/app/api/space/[spaceid]/contenttype/[contenttypeid]/delete"
import { PutContentTypeItemResponse } from "@/app/api/space/[spaceid]/contenttype/[contenttypeid]/put"
import { GetTrashResponseItem } from "@/app/api/space/[spaceid]/trash/get"
import { SpaceItem } from "@/app/api/space/get"
import { Empty } from "@/components/Empty"
import { apiClient } from "@/networking/ApiClient"
import { useSpaces } from "@/networking/hooks/spaces"
import { useTrash } from "@/networking/hooks/trash"
import {
    Box,
    Button,
    Center,
    Container,
    Heading,
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
    useDisclosure,
    useToast,
    VStack
} from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import dayjs from "dayjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { RotateCcw } from "react-feather"
export default function Home({ params }: { params: { spaceid: string } }) {
    const router = useRouter()
    const [mode, setMode] = useState<"list" | "loading">("loading")
    const [space, setSpace] = useState<SpaceItem>()
    const { spaces, isLoading: isSpacesLoading } = useSpaces({ enabled: true })
    const toast = useToast()
    const queryClient = useQueryClient()

    const { items, isLoading: isTrashLoading } = useTrash(params.spaceid, {})
    const [isRestoreLoading, setIsRestoreLoading] = useState<boolean>(false)
    const { isOpen: isRestoreOpen, onOpen: onRestoreOpen, onClose: onRestoreClose } = useDisclosure()

    const [isEmptyLoading, setIsEmptyLoading] = useState<boolean>(false)
    const { isOpen: isEmptyOpen, onOpen: onEmptyOpen, onClose: onEmptyClose } = useDisclosure()

    const [restoreItem, setRestoreItem] = useState<GetTrashResponseItem>()
    useEffect(() => {
        if (!items) return
        if (!spaces) return

        const space = spaces.find((p) => p.spaceId === params.spaceid)
        if (!space) {
            throw "Space not found"
        }
        setSpace(space)

        setMode("list")
    }, [items, spaces])

    return (
        <>
            {mode == "loading" && (
                <Center h="100vh" w="100%">
                    <Spinner size="xl" colorScheme="blue"></Spinner>
                </Center>
            )}

            <Modal isOpen={isEmptyOpen} onClose={onEmptyClose} isCentered={true}>
                <ModalOverlay />
                <ModalContent maxW="600px">
                    <ModalHeader pt={10} px={10} pb={0}>
                        Empty trash
                    </ModalHeader>
                    <ModalCloseButton right={10} top={10} />
                    <ModalBody overflow="auto" p={10}>
                        <VStack alignItems={"flex-start"} spacing={5}>
                            <Box>Are you sure you with to empty the trash? Items in the trash will not be recoverable.</Box>
                        </VStack>
                    </ModalBody>

                    <ModalFooter pb={10} px={10} gap={10}>
                        <Button
                            isLoading={isEmptyLoading}
                            colorScheme="red"
                            mr={3}
                            minW="150px"
                            onClick={async () => {
                                try {
                                    setIsEmptyLoading(true)
                                    const response = await apiClient.delete<DeleteContentTypeItemResponse>({
                                        path: `/space/${params.spaceid}/trash`,
                                        isAuthRequired: true,
                                    })

                                    queryClient.invalidateQueries([["trash", params.spaceid]])
                                    toast({
                                        title: "Trash emptied",
                                        status: "success",
                                        position: "bottom-right",
                                    })
                                    setIsEmptyLoading(false)

                                    onEmptyClose()
                                } catch (ex) {
                                    setIsEmptyLoading(false)
                                    toast({
                                        title: "Trash could not be emptied.",
                                        status: "error",
                                        position: "bottom-right",
                                    })
                                    onEmptyClose()
                                }
                            }}
                        >
                            Yes, Empty
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                onEmptyClose()
                            }}
                        >
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isRestoreOpen} onClose={onRestoreClose} isCentered={true}>
                <ModalOverlay />
                <ModalContent maxW="600px">
                    <ModalHeader pt={10} px={10} pb={0}>
                        Restore content "{restoreItem?.title}"
                    </ModalHeader>
                    <ModalCloseButton right={10} top={10} />
                    <ModalBody overflow="auto" p={10}>
                        <VStack alignItems={"flex-start"} spacing={5}>
                            <Box>Are you sure you with to restore the content?</Box>
                        </VStack>
                    </ModalBody>

                    <ModalFooter pb={10} px={10} gap={10}>
                        <Button
                            isLoading={isRestoreLoading}
                            colorScheme="green"
                            mr={3}
                            minW="150px"
                            onClick={async () => {
                                try {
                                    setIsRestoreLoading(true)
                                    const response = await apiClient.put<PutContentTypeItemResponse>({
                                        path: `/space/${params.spaceid}/trash/${restoreItem?.contentId}`,
                                        isAuthRequired: true,
                                    })

                                    queryClient.invalidateQueries([["trash", params.spaceid]])
                                    queryClient.invalidateQueries([["content", params.spaceid]])
                                    toast({
                                        title: "Content restored",
                                        status: "success",
                                        position: "bottom-right",
                                    })

                                    router.push(`/portal/spaces/${params.spaceid}/content/${restoreItem?.contentId}`)
                                } catch (ex) {
                                    setIsRestoreLoading(false)
                                    onRestoreClose()
                                    toast({
                                        title: "Content could not be restored",
                                        status: "error",
                                        position: "bottom-right",
                                    })
                                }
                            }}
                        >
                            Restore
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                onRestoreClose()
                            }}
                        >
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {mode == "list" && (
                <Container maxW="1000px">
                    <VStack w="100%" spacing="10">
                        <HStack w="100%" mt="20px">
                            <Heading flex={1}>Trash</Heading>
                            <Button colorScheme={"blue"} w="150px" onClick={() => router.push(`/portal/spaces/${params.spaceid}/content`)}>
                                BACK
                            </Button>
                            {space?.role === "owner" && items!.length > 0 && (
                                <Button colorScheme={"red"} w="150px" onClick={onEmptyOpen}>
                                    EMPTY TRASH
                                </Button>
                            )}
                        </HStack>
                        <Box bg="white" padding="10" w="100%">
                            {items!.length > 0 ? (
                                <Table>
                                    <Thead>
                                        <Tr>
                                            <Th>TITLE</Th>
                                            <Th>CONTENT TYPE</Th>
                                            <Th>DELETED BY</Th>
                                            <Th>DELETED</Th>
                                            <Th></Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {items?.map((s) => (
                                            <Tr key={s.contentId} _hover={{ backgroundColor: "#fafafa", cursor: "pointer" }}>
                                                <Td fontWeight="600">{s.title}</Td>
                                                <Td>{s.contentType}</Td>
                                                <Td>{s.deletedUserName}</Td>
                                                <Td>{dayjs(s.deleted).format("YYYY-MM-DD HH:mm")}</Td>
                                                <Td textAlign={"right"}>
                                                    <Button
                                                        variant={"ghost"}
                                                        onClick={() => {
                                                            setRestoreItem(s)
                                                            onRestoreOpen()
                                                        }}
                                                    >
                                                        <HStack>
                                                            <Box as="span" color="blue.500">
                                                                RESTORE
                                                            </Box>
                                                            <RotateCcw></RotateCcw>
                                                        </HStack>
                                                    </Button>
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            ) : (
                                <Empty></Empty>
                            )}
                        </Box>
                    </VStack>
                </Container>
            )}
        </>
    )
}
