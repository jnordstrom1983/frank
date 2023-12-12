"use client"

import { usePhrases } from "@/lib/lang"
import { useAppStore } from "@/stores/appStore"
import { Box, Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, VStack } from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

export function Dialogs({ children }: { children: React.ReactNode }) {

    const { t } = usePhrases();

    const { isSignoutVisible, setSignoutVisible } = useAppStore((state) => state)
    const queryClient = useQueryClient();
    const router = useRouter()
    return (
        <>
            <Modal
                isOpen={isSignoutVisible}
                onClose={() => {
                    setSignoutVisible(false)
                }}
                isCentered={true}
            >
                <ModalOverlay />
                <ModalContent maxW="600px">
                    <ModalHeader pt={10} px={10} pb={0}>
                        {t("dialogs_signout_heading")}
                    </ModalHeader>
                    <ModalCloseButton right={10} top={10} />
                    <ModalBody overflow="auto" p={10}>
                        <VStack alignItems={"flex-start"} spacing={5}>
                            <Box>{t("dialogs_signout_question")}</Box>
                        </VStack>
                    </ModalBody>

                    <ModalFooter pb={10} px={10} gap={10}>
                        <Button colorScheme="blue" onClick={() => {
                            localStorage.removeItem("FRANK_AUTH_TOKEN")
                            queryClient.clear()
                            setSignoutVisible(false);
                            router.push(`/`)

                        }}>{t("dialogs_signout_button")}</Button>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setSignoutVisible(false)
                            }}
                        >
                            {t("cancel")}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {children}
        </>
    )
}
