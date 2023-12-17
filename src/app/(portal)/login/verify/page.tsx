"use client"
import { UserVerifyPostResponse } from "@/app/api/user/verify/route"
import { ThemeContext } from "@/app/(portal)/theme"
import TextInput from "@/components/TextInput"
import { apiClient } from "@/networking/ApiClient"
import { Box, Button, Center, Flex, Heading, Image, Text, VStack, useToast } from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useContext, useEffect, useState } from "react"
import { X } from "react-feather"
import { useAppStore } from "@/stores/appStore"
import { languageOptions, usePhrases } from "@/lib/lang"
export default function Verify() {
    const router = useRouter()
    const queryClient = useQueryClient()
    const urlParams = new URLSearchParams(typeof (window) !== "undefined" ? window.location.search : "")
    const token = urlParams.get("token")
    const toast = useToast()
    const theme = useContext(ThemeContext);

    const { uiLanguage, setUiLanguage} = useAppStore(state=>state);
    const { t } = usePhrases(); 



    
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
            localStorage.setItem("FRANK_AUTH_TOKEN", response.token)
            queryClient.removeQueries(["profile"])
            router.push(`/`)

        } catch (ex) {
            toast({
                title: t("login_verify_verify_error_title"),
                description: t("login_verify_verify_error_description"),
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
            <Image src={theme!.horizontalLogo} w="150px" position={"fixed"} right="20px" top="20px"></Image>
            <Box position={"fixed"} left="20px" top="20px" width="200px">
                <TextInput type="select"  options={languageOptions} value={uiLanguage} onChange={setUiLanguage}></TextInput>
            </Box>

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
                        <Heading>{t("login_verify_title")}</Heading>
                        <Text color="gray">
                            {t("login_verify_description")}
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
                            subject={t("login_verify_input_subject")}
                        />

                        <Button
                            colorScheme={"green"}
                            w="100%"
                            isLoading={loading}
                            onClick={() => {
                                login(code)
                            }}
                        >
                            {t("login_verify_button")}
                        </Button>
                    </VStack>
                </Box>
            </Center>
        </>
    )
}
