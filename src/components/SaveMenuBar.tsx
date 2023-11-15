import { ThemeContext } from "@/app/(portal)/theme"
import { Box, Button, Container, Flex, HStack, Heading, Image } from "@chakra-ui/react"
import { useContext } from "react"
import { X } from "react-feather"

export function SaveMenuBar({
    onPositive,
    onNeutral,
    onClose,
    positiveText,
    neutralText,
    children,
    positiveLoading = false,
    neutralLoading = false
}: {
    onPositive?: () => void
    onNeutral?: () => void
    onClose?: () => void
    positiveText?: string
    neutralText?: string
    children: React.ReactNode
    positiveLoading?: boolean
    neutralLoading?: boolean
}) {
    const theme = useContext(ThemeContext);
    return (
        <Box backgroundColor="#fff" position={"fixed"} left="0" right="0" top="0" zIndex={10}>
            <HStack w="100%" p="3" height={"75px"}>
                <Box width="150px">
                    <Image src={theme!.horizontalLogo} w="150px"></Image>
                </Box>

                <Flex flex={1} alignItems={"center"}>
                    <Container maxW="1000">
                        <HStack w="100%" justifyContent="flex-start">
                            <Heading flex={1} fontSize="24px">
                                {children}
                            </Heading>
                            {neutralText && (
                                <Button colorScheme="blue" minW="120px" onClick={onNeutral} isLoading={neutralLoading}>
                                    {neutralText}
                                </Button>
                            )}
                            {positiveText && (
                                <Button colorScheme="green" minW="120px" onClick={onPositive} isLoading={positiveLoading}>
                                    {positiveText}
                                </Button>
                            )}
                        </HStack>
                    </Container>
                </Flex>
                <Flex width="150px" justifyContent="flex-end">
                    <Button variant={"ghost"} onClick={onClose}>
                        <X size={32} />
                    </Button>
                </Flex>
            </HStack>
        </Box>
    )
}
