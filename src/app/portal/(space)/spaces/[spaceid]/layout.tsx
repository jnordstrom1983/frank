"use client"
import { SpaceItem } from "@/app/api/space/get"
import { PutProfileResponse } from "@/app/api/user/profile/put"
import { AdminMenu } from "@/components/AdminMenu"
import { chunks } from "@/lib/utils"
import { apiClient } from "@/networking/ApiClient"
import { useSpaces } from "@/networking/hooks/spaces"
import { useProfile } from "@/networking/hooks/user"
import { useAppStore } from "@/stores/appStore"
import { Box, Button, Flex, HStack, Image, VStack } from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Book, Sliders, X } from "react-feather"
export default function DashboardLayout({ children, params }: { children: React.ReactNode; params: { spaceid: string } }) {
    const { profile, isLoading } = useProfile()
    const { mainMenu, isMainMenuVisible, setSignoutVisible } = useAppStore((state) => state)
    const queryClient = useQueryClient()
    const { spaces } = useSpaces({ enabled: true })
    const spaceChunks: SpaceItem[][] = chunks<SpaceItem>(
        (spaces || []).filter((s) => s.role),
        10
    )
    const [space, setSpace] = useState<SpaceItem>()
    useEffect(() => {
        if (!spaces) return
        setSpace(spaces.find((s) => s.spaceId === params.spaceid))
    }, [spaces])
    const [showOverlay, setShowOverlay] = useState<boolean>(false)
    const router = useRouter()

    useEffect(() => {
        if (!params.spaceid) return
        if (!profile) return

        if (profile!.lastUsedSpaceId !== params.spaceid) {
            ;(async () => {
                apiClient.put<PutProfileResponse, PutProfileResponse>({
                    path: `/user/profile`,
                    body: {
                        lastUsedSpaceId: params.spaceid,
                    },
                    isAuthRequired: true,
                })
                queryClient.invalidateQueries(["profile"])
            })()
        }
    }, [params.spaceid, profile])
    return profile ? (
        <>
            {showOverlay && (
                <Flex
                    height="100vh"
                    width="100%"
                    onClick={() => setShowOverlay(false)}
                    position={"fixed"}
                    left="0"
                    right="0"
                    top="0"
                    backgroundColor={"rgba(0,0,0,0.05)"}
                    zIndex={10}
                    flexDir={"column"}
                >
                    <Flex width={"100%"} backgroundColor={"white"} minHeight={"300px"} boxShadow="0px 10px 20px rgba(0, 0, 0, 0.1);">
                        <VStack width={"100%"} alignItems={"flex-start"}>
                            <HStack w="100%" p="3" height={"75px"}>
                                <Image src="/static/logofull.svg" w="150px"></Image>
                                <Flex flex={1}></Flex>
                                <Button
                                    variant={"ghost"}
                                    onClick={() => {
                                        setShowOverlay(false)
                                    }}
                                >
                                    <X size={32} />
                                </Button>
                            </HStack>

                            <HStack w="100%" p="3" alignItems={"flex-start"}>
                                <VStack alignItems={"flex-start"} justifyContent={"flex-start"}>
                                    <Box px={2}>
                                        <HStack>
                                            <Box fontWeight={"bold"}>SPACES</Box>
                                            {["admin"].includes(profile.role) && (
                                                <Button
                                                    variant={"ghost"}
                                                    onClick={() => {
                                                        router.push("/portal/spaces")
                                                    }}
                                                >
                                                    <Sliders size={24} />
                                                </Button>
                                            )}
                                        </HStack>
                                    </Box>
                                    <Box px={2}>
                                        <HStack alignItems="flex-start" spacing={10}>
                                            {spaceChunks.map((spaces, index) => (
                                                <Box key={index}>
                                                    {spaces?.map((s) => (
                                                        <Box mb={2} key={s.spaceId}>
                                                            <Button
                                                                colorScheme={params.spaceid === s.spaceId ? "blue" : undefined}
                                                                height="25px"
                                                                padding="5px"
                                                                fontSize="12px"
                                                                onClick={() => {
                                                                    router.push(`/portal/spaces/${s.spaceId}/content`)
                                                                    setShowOverlay(false)
                                                                }}
                                                            >
                                                                {s.name}
                                                            </Button>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            ))}
                                        </HStack>
                                    </Box>
                                </VStack>
                                {profile.role === "admin" && <AdminMenu></AdminMenu>}

                                <Flex flex={1}></Flex>
                                <VStack alignItems={"flex-end"}>
                                    <Box fontWeight={"bold"} px={2} mb={2} textTransform={"uppercase"}>
                                        {profile.name}
                                    </Box>
                                    {space?.role === "owner" && (
                                        <Button
                                            variant={"ghost"}
                                            p={2}
                                            color="blue.500"
                                            onClick={() => {
                                                window.open(`/docs/content/${params.spaceid}`, "_blank")
                                            }}
                                        >
                                            CONTENT API
                                        </Button>
                                    )}
                                    {space?.role === "owner" && (
                                        <Button
                                            variant={"ghost"}
                                            p={2}
                                            color="blue.500"
                                            onClick={() => {
                                                window.open(`/docs/space/${params.spaceid}`, "_blank")
                                            }}
                                        >
                                            SPACE API
                                        </Button>
                                    )}
                                    {profile.role === "admin" && (
                                        <Button
                                            variant={"ghost"}
                                            p={2}
                                            color="blue.500"
                                            onClick={() => {
                                                window.open(`/docs/management`, "_blank")
                                            }}
                                        >
                                            MANAGEMENT API
                                        </Button>
                                    )}

                                    <Button
                                        variant={"ghost"}
                                        p={2}
                                        color="blue.500"
                                        onClick={() => {
                                            setSignoutVisible(true)
                                            setShowOverlay(false)
                                        }}
                                    >
                                        SIGN OUT
                                    </Button>
                                </VStack>
                            </HStack>
                        </VStack>
                    </Flex>
                    <Flex flex={1}></Flex>
                </Flex>
            )}
            {isMainMenuVisible && (
                <Flex background="white" height="75px" position={"fixed"} left="0" right="0" top="0" zIndex={10}>
                    <HStack w="300px" h="75px">
                        <Image src="/static/logoicon.svg" ml="3" maxW="50px"></Image>
                        <VStack alignItems={"flex-start"}>
                            <Image src="/static/logotext.svg" maxW="80px"></Image>
                            <Button
                                colorScheme="blue"
                                height="25px"
                                padding="5px"
                                fontSize="12px"
                                onClick={() => {
                                    setShowOverlay(!showOverlay)
                                }}
                            >
                                {spaces?.find((p) => p.spaceId === params.spaceid)?.name}
                            </Button>
                        </VStack>
                    </HStack>
                    <HStack h="75px" flex={1}>
                        <MenuButton
                            text="Content"
                            selected={mainMenu === "content"}
                            onClick={() => {
                                setShowOverlay(false)
                                router.push(`/portal/spaces/${params.spaceid}/content`)
                            }}
                        ></MenuButton>
                        <MenuButton
                            text="Assets"
                            selected={mainMenu === "asset"}
                            onClick={() => {
                                setShowOverlay(false)

                                router.push(`/portal/spaces/${params.spaceid}/asset`)
                            }}
                        ></MenuButton>
                        {["admin"].includes(profile.role) && (
                            <MenuButton
                                text="Content types"
                                selected={mainMenu === "contentType"}
                                onClick={() => {
                                    setShowOverlay(false)

                                    router.push(`/portal/spaces/${params.spaceid}/contenttype`)
                                }}
                            ></MenuButton>
                        )}
                        {["admin"].includes(profile.role) && (
                            <MenuButton
                                text="Settings"
                                selected={mainMenu === "settings"}
                                onClick={() => {
                                    setShowOverlay(false)

                                    router.push(`/portal/spaces/${params.spaceid}/settings`)
                                }}
                            ></MenuButton>
                        )}
                    </HStack>
                    <Flex h="75px" w="75px" alignItems={"center"} justifyContent={"center"}>
                        <Button
                            w="60px"
                            h="60px"
                            bg="blue.200"
                            borderRadius={"50%"}
                            alignItems={"center"}
                            justifyContent={"center"}
                            fontSize="32px"
                            color="white"
                            onClick={() => {
                                setShowOverlay(!showOverlay)
                            }}
                        >
                            {profile.name.substring(0, 1).toUpperCase()}
                        </Button>
                    </Flex>
                </Flex>
            )}

            <Flex w="100%" mt={isMainMenuVisible ? "78px" : "0px"} flexDir={"column"}>
                <Box>{children}</Box>
            </Flex>
        </>
    ) : (
        <></>
    )
}

function MenuButton({ text, selected, onClick }: { text: string; selected: boolean; onClick?: () => void }) {
    return (
        <Flex h="75px" borderBottomWidth="3px" borderBottomColor={selected ? "blue.500" : "white"} alignItems={"center"} w="200px" justifyContent={"center"}>
            <Button variant={"ghost"} fontWeight={selected ? "bold" : "normal"} color={selected ? "blue.500" : "black"} w="100%" h="100%" onClick={onClick}>
                {text}
            </Button>
        </Flex>
    )
}
