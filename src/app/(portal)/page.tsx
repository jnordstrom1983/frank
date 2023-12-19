"use client"
import TextInput from "@/components/TextInput"
import { apiClient } from "@/networking/ApiClient"
import { useSpaces } from "@/networking/hooks/spaces"
import { useProfile } from "@/networking/hooks/user"
import { Box, Button, Center, HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, VStack, useToast } from "@chakra-ui/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { z } from "zod"
import { PutProfileRequest, PutProfileResponse } from "../api/user/profile/put"
import { useQueryClient } from "@tanstack/react-query"
import { getSpaceHome } from "@/lib/utils"
import { SpaceItem } from "../api/space/get"
import { usePhrases } from "@/lib/lang"

export default function Home() {
    const { profile, isLoading: isProfileLoading } = useProfile()
    const { spaces } = useSpaces({ enabled: !!profile })
    const { t } = usePhrases();
    const router = useRouter()
    const [showWelcome, setShowWelcome] = useState<boolean>(false)
    const [name, setName] = useState<string>("")
    const [saveLoading, setSaveLoading] = useState<boolean>(false)
    const toast = useToast()

    const queryClient = useQueryClient()

    useEffect(() => {
        if (isProfileLoading) return
        if (!isProfileLoading && !profile) {
            router.replace("/login")
        }
        if (!spaces) return

        if(!profile!.name || profile!.name === profile!.email){
            setShowWelcome(true)
            return
         }

        if (spaces.length == 0) {
            router.replace("/portal/spaces")
        } else {
            if(profile!.lastUsedSpaceId){
                if(spaces.find(p=>p.spaceId === profile!.lastUsedSpaceId)){
                    const space = spaces.find(p=>p.spaceId === profile!.lastUsedSpaceId)
                    const url = getSpaceHome(profile!, space as SpaceItem)
                    router.replace(url);        
                    return;
                }
            }
            const url = getSpaceHome(profile!, spaces[0] as SpaceItem)
            router.replace(url)
        }
    }, [isProfileLoading, profile, spaces])

    async function save(name : string){
        setSaveLoading(true)
        try {
            const response = await apiClient.put<PutProfileResponse, PutProfileRequest>({
                path: `/user/profile`,
                isAuthRequired: true,
                body: {
                    name,
                },
            })

            setSaveLoading(false)
            queryClient.removeQueries(["profile"])
            setShowWelcome(false)
        } catch (ex) {
            toast({
                title: "Could not set your name",
                description: "Please check your data and try again.",
                status: "error",
                position: "bottom-right",
            })
            setSaveLoading(false)
        }
    }

    return showWelcome ? (
        <Modal isOpen={true} onClose={() => {}} isCentered={true}>
            <ModalOverlay />
            <ModalContent maxW="600px">
                <ModalHeader pt={10} px={10} pb={0}>
                    {t("welcome_welcome")}
                </ModalHeader>
                <ModalBody overflow="auto" p={10}>
                    <VStack alignItems={"flex-start"} spacing={5}>
                        <Box> {t("welcome_description")}</Box>
                        <TextInput value={name} focus={true} onChange={setName} validate={z.string().min(3)} onSubmit={(value) => save(value)} placeholder="John Doe"></TextInput>
                    </VStack>
                </ModalBody>

                <ModalFooter pb={10} px={10} gap={10}>
                    <Button
                        colorScheme="green"
                        width="150px"
                        isLoading={saveLoading}
                        onClick={async () => {
                         save(name)
                        }}
                    >
                        {t("welcome_save")}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    ) : (
        <Center h="100vh" w="100%">
            <Spinner size="xl" colorScheme="blue"></Spinner>
        </Center>
    )
}
