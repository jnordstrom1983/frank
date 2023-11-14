"use client"
import TextInput from "@/components/TextInput"
import { apiClient } from "@/networking/ApiClient"
import { Box, Button, Center, Heading, Image, VStack } from "@chakra-ui/react"
import { useRouter } from "next/navigation"
import { useContext, useState } from "react"
import { UserLoginPostResponse } from "../api/user/login/route"
import { ThemeContext } from "../theme"

export default function Login() {
    const router = useRouter()
    const [email, setEmail] = useState<string>("")
    const [loading, setLoading] = useState<boolean>()
    const theme = useContext(ThemeContext);

    async function login(email: string) {
        if (loading) return

        setLoading(true)

        try {
            const response = await apiClient.post<UserLoginPostResponse>({
                path: "/user/login",
                isAuthRequired: false,
                body: {
                    email,
                },
            })

            router.push(`/login/verify?token=${response.token}&code=`)
        } catch (ex) {
            setLoading(false)
        }
    }

    return (
        <>
            <Image src={theme!.horizontalLogo} w="150px" position={"fixed"} right="20px" top="20px"></Image>

            <Center w="100%" h="100vh">
                <Box bg={"white"} padding={20} width="600px">
                    <VStack spacing={10} alignItems={"flex-start"} w="100%">
                        <Heading>Sign in</Heading>

                        <TextInput
                            value={email}
                            disabled={loading}
                            subject="E-mail"
                            onChange={setEmail}
                            focus={true}
                            onSubmit={(value) => {
                                login(value)
                            }}
                            placeholder="email@example.com"
                        />

                        <Button colorScheme={"green"} w="100%" isDisabled={loading} isLoading={loading} onClick={() => login(email)}>
                            Sign in
                        </Button>
                    </VStack>
                </Box>
            </Center>
        </>
    )
}
