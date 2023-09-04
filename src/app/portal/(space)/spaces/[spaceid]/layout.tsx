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
import { Book, ChevronDown, Sliders, X } from "react-feather"
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
            ; (async () => {
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
                    top="0px"
                    backgroundColor={"rgba(0,0,0,0.05)"}
                    zIndex={11}
                    flexDir={"column"}
                >
                    <Flex width={"100%"} backgroundColor={"white"} minHeight={"300px"} boxShadow="0px 10px 20px rgba(0, 0, 0, 0.1);">
                        <VStack width={"100%"} alignItems={"flex-start"}>
                            <HStack w="100%" p="3" height={"75px"}>
                                <Image src="/static/logo_horizontal.svg" w="150px"></Image>
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
                <>
                    <Flex background="#fff" width="80px" position={"fixed"} left="0" bottom="0" top="0" zIndex={10} flexDir={"column"}>
                        <VStack spacing={5}>
                            <VStack w="60" pt={3}>
                                <Image src="/static/logo_vertical.svg" maxW="46px"></Image>

                            </VStack>

                            <MenuButton
                                text="Content"
                                icon={<ContentIcon></ContentIcon>}
                                selected={mainMenu === "content"}
                                onClick={() => {
                                    setShowOverlay(false)
                                    router.push(`/portal/spaces/${params.spaceid}/content`)
                                }}
                            ></MenuButton>
                            <MenuButton
                                text="Assets"
                                icon={<AssetIcon></AssetIcon>}
                                selected={mainMenu === "asset"}
                                onClick={() => {
                                    setShowOverlay(false)

                                    router.push(`/portal/spaces/${params.spaceid}/asset`)
                                }}
                            ></MenuButton>
                            {["admin"].includes(profile.role) && (
                                <MenuButton
                                    text="Types"
                                    icon={<TypesIcon></TypesIcon>}
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
                                    icon={<SettingsIcon></SettingsIcon>}
                                    selected={mainMenu === "settings"}
                                    onClick={() => {
                                        setShowOverlay(false)

                                        router.push(`/portal/spaces/${params.spaceid}/settings`)
                                    }}
                                ></MenuButton>
                            )}
                        </VStack>
                        <Flex flex={1}></Flex>
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
                    <Flex background="#fff" height="46px" position={"fixed"} left="80px" right="0" top="0" zIndex={10} alignItems={"center"} justifyContent={"center"}>
                        <Box  >
                            <Button
                                variant="ghost"
                                w="100%"
                                height="32px"

                                paddingY="5px"
                                paddingX="15px"
                                fontSize="13px"
                                backgroundColor={"#f0f0f0"} borderRadius={"25px"}
                                _hover={{ borderRadius: "25px" }}
                                onClick={() => {
                                    setShowOverlay(!showOverlay)
                                }}
                            >
                                {spaces?.find((p) => p.spaceId === params.spaceid)?.name} <ChevronDown></ChevronDown>
                            </Button>
                        </Box>
                    </Flex>
                </>
            )}

            <Flex w="100%" pl={isMainMenuVisible ? "80px" : "0px"} mt={isMainMenuVisible ? "46px" : "0px"} flexDir={"column"}>
                <Box>{children}</Box>
            </Flex>
        </>
    ) : (
        <></>
    )
}

function MenuButton({ text, selected, onClick, icon }: { text: string; selected: boolean; onClick?: () => void; icon: React.ReactElement }) {
    return (
        <Flex h="60px" alignItems={"center"} w="60px" justifyContent={"center"}>
            <Button variant={"ghost"} color={selected ? "#000" : "#878787"} w="100%" h="100%" onClick={onClick}>
                <VStack>
                    {icon}
                    <Box fontSize="11px">{text}</Box>
                </VStack>
            </Button>
        </Flex>
        // <Flex h="60px"   alignItems={"center"} w="60px" justifyContent={"center"}>
        //     <Button variant={"ghost"}  color={selected ? "#fff" : "#878787"} w="100%" h="100%" backgroundColor={selected ? "blue.500" : undefined}   borderRadius={"10px"} onClick={onClick} _hover={{ backgroundColor : "blue.500", opacity : "0.8", color :"#fff",  borderRadius : "10px"}}>
        //         <VStack>
        //             {icon}
        //             <Box fontSize="11px">{text}</Box>
        //         </VStack>
        //     </Button>
        // </Flex>
    )
}

function ContentIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_311_675)">
                <path d="M12.15 5.25L0.45 16.95C0.15 17.25 0 17.55 0 18V22.5C0 23.4 0.6 24 1.5 24H6C6.45 24 6.75 23.85 7.05 23.55L18.75 11.85L12.15 5.25Z" fill="currentColor" />
                <path d="M23.55 4.95L19.05 0.45C18.45 -0.15 17.55 -0.15 16.95 0.45L14.25 3.15L20.85 9.75L23.55 7.05C24.15 6.45 24.15 5.55 23.55 4.95Z" fill="currentColor" />
            </g>
            <defs>
                <clipPath id="clip0_311_675">
                    <rect width="24" height="24" fill="currentColor" />
                </clipPath>
            </defs>
        </svg>
    )
}

function AssetIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 32 32">
            <title>browse</title>
            <g fill="currentColor">
                <path d="M27,3a1,1,0,0,0-1-1H6A1,1,0,0,0,5,3V5H27Z"></path>
                <path d="M31,7H1A1,1,0,0,0,.018,8.188l4,21A1,1,0,0,0,5,30H27a1,1,0,0,0,.982-.812l4-21A1,1,0,0,0,31,7Z" fill="currentColor"></path>
            </g>
        </svg>
    )
}

function TypesIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M13.125 14.5023L2.625 8.37732V20.1251C2.62531 20.2784 2.66589 20.4289 2.74267 20.5616C2.81945 20.6942 2.92974 20.8044 3.0625 20.8811L13.125 26.7532V14.5023Z"
                fill="currentColor"
            />
            <path
                d="M14 12.9876L24.5 6.86264L14.4375 0.994015C14.3037 0.915912 14.1515 0.874756 13.9965 0.874756C13.8415 0.874756 13.6893 0.915912 13.5555 0.994015L3.5 6.86177L14 12.9876Z"
                fill="currentColor"
            />
            <path
                d="M14.875 14.5023V26.7523L24.9375 20.8802C25.0701 20.8036 25.1803 20.6936 25.2571 20.561C25.3339 20.4285 25.3745 20.2782 25.375 20.125V8.37817L14.875 14.5023Z"
                fill="currentColor"
            />
        </svg>
    )
}

function SettingsIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_311_663)">
                <path
                    d="M20.8716 13.453C20.9534 12.9729 20.9962 12.487 20.9996 12C20.9962 11.513 20.9534 11.0271 20.8716 10.547L22.9716 8.518C23.1318 8.36305 23.2356 8.15906 23.2665 7.9384C23.2975 7.71774 23.2539 7.49305 23.1426 7.3L21.6426 4.7C21.5298 4.50766 21.3565 4.35811 21.1497 4.27471C20.9429 4.1913 20.7143 4.17875 20.4996 4.239L17.6996 5.039C16.9415 4.42153 16.0881 3.93146 15.1726 3.588L14.4696 0.758C14.4157 0.541568 14.2909 0.349398 14.1151 0.212049C13.9393 0.0747014 13.7227 6.1623e-05 13.4996 0H10.4996C10.2766 6.1623e-05 10.0599 0.0747014 9.88418 0.212049C9.70841 0.349398 9.58362 0.541568 9.52964 0.758L8.82264 3.588C7.90861 3.93185 7.05652 4.4219 6.29964 5.039L3.49964 4.239C3.28495 4.17892 3.05642 4.19156 2.84967 4.27495C2.64292 4.35834 2.46957 4.50779 2.35664 4.7L0.856638 7.3C0.745116 7.49316 0.70137 7.71805 0.732354 7.93893C0.763338 8.1598 0.867275 8.36398 1.02764 8.519L3.12764 10.548C3.04593 11.0278 3.00312 11.5133 2.99964 12C3.00307 12.487 3.04587 12.9729 3.12764 13.453L1.02764 15.482C0.867509 15.6369 0.763719 15.8409 0.73274 16.0616C0.701761 16.2823 0.745367 16.5069 0.856638 16.7L2.35664 19.3C2.44449 19.4522 2.57088 19.5785 2.72309 19.6663C2.87529 19.754 3.04794 19.8002 3.22364 19.8C3.31658 19.7996 3.40906 19.7868 3.49864 19.762L6.29864 18.962C7.05673 19.5795 7.91021 20.0695 8.82564 20.413L9.53264 23.243C9.58668 23.4587 9.71111 23.6503 9.88625 23.7874C10.0614 23.9245 10.2772 23.9993 10.4996 24H13.4996C13.7227 23.9999 13.9393 23.9253 14.1151 23.788C14.2909 23.6506 14.4157 23.4584 14.4696 23.242L15.1766 20.412C16.0907 20.0681 16.9428 19.5781 17.6996 18.961L20.4996 19.761C20.5892 19.7858 20.6817 19.7986 20.7746 19.799C20.9503 19.7992 21.123 19.753 21.2752 19.6653C21.4274 19.5775 21.5538 19.4512 21.6416 19.299L23.1416 16.699C23.2532 16.5058 23.2969 16.2809 23.2659 16.0601C23.2349 15.8392 23.131 15.635 22.9706 15.48L20.8716 13.453ZM11.9996 16C11.2085 16 10.4352 15.7654 9.77736 15.3259C9.11956 14.8864 8.60687 14.2616 8.30412 13.5307C8.00137 12.7998 7.92216 11.9956 8.0765 11.2196C8.23084 10.4437 8.6118 9.73098 9.17121 9.17157C9.73062 8.61216 10.4434 8.2312 11.2193 8.07686C11.9952 7.92252 12.7995 8.00173 13.5304 8.30448C14.2613 8.60723 14.886 9.11992 15.3255 9.77772C15.765 10.4355 15.9996 11.2089 15.9996 12C15.9996 13.0609 15.5782 14.0783 14.8281 14.8284C14.0779 15.5786 13.0605 16 11.9996 16Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath id="clip0_311_663">
                    <rect width="24" height="24" fill="currentColor" />
                </clipPath>
            </defs>
        </svg>
    )
}
