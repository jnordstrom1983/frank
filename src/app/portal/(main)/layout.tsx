"use client"
import { ThemeContext } from "@/app/theme"
import { AdminMenu } from "@/components/AdminMenu"
import { useProfile } from "@/networking/hooks/user"
import { useAppStore } from "@/stores/appStore"
import { Box, Flex, VStack, Image, Button, HStack } from "@chakra-ui/react"
import { useRouter } from "next/navigation"
import { useContext, useState } from "react"
import { X, Sliders, AlignJustify } from "react-feather"
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { profile, isLoading } = useProfile()
    const [showOverlay, setShowOverlay] = useState<boolean>(false)
    const theme = useContext(ThemeContext);
    const router = useRouter()


    const { setSignoutVisible, isMainMenuVisible } = useAppStore((state) => state)
    return (
        profile ?
            <>
                {showOverlay && <Flex height="100vh" onClick={() => setShowOverlay(false)} width="100%" position={"fixed"} left="0" right="0" top="0" backgroundColor={"rgba(0,0,0,0.05)"} zIndex={10} flexDir={"column"} >
                    <Flex width={"100%"} backgroundColor={"white"} minHeight={"300px"} boxShadow="0px 10px 20px rgba(0, 0, 0, 0.1);">
                        <VStack width={"100%"} alignItems={"flex-start"}>
                            <HStack w="100%" p="3" height={"75px"}>
                                <Image src={theme!.horizontalLogo} w="150px"></Image>
                                <Flex flex={1}></Flex>
                                <Button variant={"ghost"} onClick={() => { setShowOverlay(false) }}>
                                    <X size={32} />
                                </Button>
                            </HStack>


                            <HStack w="100%" px={5}>
                                {profile.role === "admin" && <AdminMenu ml={0} onHideOverlay={() => setShowOverlay(false)}></AdminMenu>}

                                <VStack alignItems={"flex-end"} w="100%">
                                    <Box fontWeight={"bold"} px={2} mb={2} textTransform={"uppercase"}>
                                        {profile.name}
                                    </Box>
                                    <Button variant={"ghost"} p={2} color="blue.500" onClick={() => {
                                        window.open(`/docs/management`, "_blank")
                                    }}>
                                        MANAGEMENT API
                                    </Button>


                                    <Button variant={"ghost"} p={2} color="blue.500" onClick={() => {
                                        setSignoutVisible(true)
                                        setShowOverlay(showOverlay)
                                    }}>
                                        SIGN OUT
                                    </Button>
                                </VStack>


                            </HStack>




                        </VStack>
                    </Flex>
                    <Flex flex={1}></Flex>
                </Flex>}
                {isMainMenuVisible && <Flex background="white" height="75px" position={"fixed"} left="0" right="0" top="0" zIndex={10} >
                    <HStack w="300px" h="75px">
                        <Image src={theme!.horizontalLogo} w="150px" ml="3" cursor={"pointer"} onClick={() => {
                            setShowOverlay(true)
                        }}></Image>
                    </HStack>
                    <Flex flex={1} justifyContent={"flex-end"}>
                        <Flex h="75px" w="75px" alignItems={"center"} justifyContent={"center"}>
                            <Button w="60px" h="60px" alignItems={"center"} variant={"ghost"} justifyContent={"center"} fontSize="32px" onClick={() => {
                                setShowOverlay(true)
                            }}>
                                <AlignJustify size="48px"></AlignJustify>
                            </Button>
                        </Flex>
                    </Flex>
                </Flex>}

                <Flex w="100%" mt="78px" flexDir={"column"}>
                    {children}
                </Flex>
            </> : <></>
    )
}

