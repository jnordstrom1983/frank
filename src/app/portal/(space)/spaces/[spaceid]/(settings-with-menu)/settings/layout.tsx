"use client"
import { useSpaces } from "@/networking/hooks/spaces"
import { useAppStore } from "@/stores/appStore"
import { Box, Button, Flex, VStack } from "@chakra-ui/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Layout({ children, params }: { children: React.ReactNode; params: { spaceid: string; setting: string } }) {
    const router = useRouter()
    
    const { setMainMenu, mainMenu, settingsMenu } = useAppStore((state) => state)
    useEffect(() => {
        if (mainMenu !== "settings") setMainMenu("settings")
    }, [mainMenu])
    return (
        <>
            <Flex style={{ minHeight: "calc(100vh - 78px)" }} flex={1} flexDir={"column"} position={"relative"}>
                <Flex flex={1} flexDir={"row"}>
                    <Flex bg="#fff" width="250px" p={5}>
                        <VStack spacing={10} alignItems={"flex-start"} w="100%">
                            <VStack alignItems={"flex-start"} w="100%">
                                <Box fontWeight={"bold"} flex={1}>
                                    SETTINGS
                                </Box>
                                <SelectionButton
                                    text="General settings"
                                    selected={settingsMenu === "main"}
                                    onClick={() => {
                                        router.push(`/portal/spaces/${params.spaceid}/settings`)
                                    }}
                                ></SelectionButton>
                            </VStack>

                            <VStack alignItems={"flex-start"} w="100%">
                                <Box fontWeight={"bold"} flex={1}>
                                    USERS
                                </Box>
                                <SelectionButton
                                    text="Users"
                                    selected={settingsMenu === "users"}
                                    onClick={() => {
                                        router.push(`/portal/spaces/${params.spaceid}/settings/user`)
                                    }}
                                ></SelectionButton>
                                <SelectionButton
                                    text="API Keys"
                                    selected={settingsMenu === "api"}
                                    onClick={() => {
                                        router.push(`/portal/spaces/${params.spaceid}/settings/user/api`)
                                    }}
                                ></SelectionButton>
                                
                                    <SelectionButton
                                        text="Content access keys"
                                        selected={settingsMenu === "keys"}
                                        onClick={() => {
                                            router.push(`/portal/spaces/${params.spaceid}/settings/user/keys`)
                                        }}
                                    ></SelectionButton>
                                
                            </VStack>

                            <VStack alignItems={"flex-start"} w="100%">
                                <Box fontWeight={"bold"} flex={1}>
                                    INTEGRATIONS
                                </Box>
                                <SelectionButton
                                    text="Webhooks"
                                    selected={settingsMenu === "webhooks"}
                                    onClick={() => {
                                        router.push(`/portal/spaces/${params.spaceid}/settings/webhooks`)
                                    }}
                                ></SelectionButton>
                            </VStack>
                        </VStack>
                    </Flex>
                    <Flex flex={1}>
                        <Box p={10} w="100%" maxW="1400px">
                            {children}
                        </Box>
                    </Flex>
                </Flex>
            </Flex>
        </>
    )
}

function SelectionButton({ onClick, text, selected }: { selected: boolean; onClick: () => void; text: string }) {
    if (selected) {
        return (
            <Button
                variant={"ghost"}
                fontWeight={"bold"}
                bg="blue.500"
                color="white"
                padding="2"
                px={5}
                borderRadius="25px"
                fontSize={"14px"}
                _hover={{ opacity: 0.8 }}
                onClick={onClick}
            >
                {text}
            </Button>
        )
    } else {
        return (
            <Button variant={"ghost"} fontSize={"14px"} color="gray.600" borderRadius="25px" onClick={onClick}>
                {text}
            </Button>
        )
    }
}
