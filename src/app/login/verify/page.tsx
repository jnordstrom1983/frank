"use client"
import { UserVerifyPostResponse } from "@/app/api/user/verify/route"
import TextInput from "@/components/TextInput"
import { apiClient } from "@/networking/ApiClient"
import { Box, Button, Center, Flex, Heading, Image, Text, VStack, useToast } from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { X } from "react-feather"
export default function Verify() {
    const router = useRouter()
    const queryClient = useQueryClient()
    const urlParams = new URLSearchParams(typeof (window) !== "undefined" ? window.location.search : "")
    const token = urlParams.get("token")
    const toast = useToast()

    const [code, setCode] = useState<string>(urlParams.get("code") || "")
    const [loading, setLoading] = useState<boolean>()
    async function login(code: string) {
        if (loading) return

        setLoading(true)

        try {
            const response = await apiClient.post<UserVerifyPostResponse>({
                path: "/user/verify",
                isAuthRequired: false,
                body: {
                    token,
                    code: code.replace(/\ /g, ""),
                },
            })

            setLoading(false)
            localStorage.setItem("CHARLEE_AUTH_TOKEN", response.token)
            queryClient.removeQueries(["profile"])
            router.push(`/`)

        } catch (ex) {
            toast({
                title: "Could not login",
                description: "Please check that the code is valid or try again.",
                status: "error",
                position: "bottom-right"
            })
            setLoading(false)
        }
    }

    useEffect(() => {
        const code = urlParams.get("code");

        if (code) {
            login(code);
        }
    }, [])

    return (
        <>
            <Image src="/static/logofull.svg" w="150px" position={"fixed"} right="20px" top="20px"></Image>

            <Center w="100%" h="100vh">
                <Box bg={"white"} padding={20} width="600px">
                    <Flex w="100%" justifyContent={"flex-end"}>
                        <Button
                            variant={"ghost"}
                            marginTop={-10}
                            onClick={() => {
                                router.replace("/login")
                            }}
                        >
                            <X size={32} />
                        </Button>
                    </Flex>

                    <VStack spacing={10} alignItems={"flex-start"} w="100%">
                        <Heading>Check your email</Heading>
                        <Text color="gray">
                            A temporary verification code has been sent to your email address. To log in, enter the code below or click on the link in the email.
                        </Text>

                        <TextInput
                            value={code}
                            onChange={setCode}
                            disabled={loading}
                            focus={true}
                            onSubmit={(value) => {
                                login(code)
                            }}
                            type="password"
                            placeholder="11 22 33 44"
                            subject="Verification code"
                        />

                        <Button
                            colorScheme={"green"}
                            w="100%"
                            isLoading={loading}
                            onClick={() => {
                                login(code)
                            }}
                        >
                            Sign in
                        </Button>
                    </VStack>
                </Box>
            </Center>
        </>
    )
}
