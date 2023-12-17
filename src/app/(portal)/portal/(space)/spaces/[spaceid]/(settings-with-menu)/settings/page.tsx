"use client"
import { PutSpaceRequest, PutSpaceResponse } from "@/app/api/space/[spaceid]/put"
import { CheckboxInput } from "@/components/CheckboxInput"
import { CheckboxList } from "@/components/CheckboxList"
import TextInput from "@/components/TextInput"
import { getAllLangauges } from "@/lib/lang"

import { SpaceModules } from "@/lib/spaceModules"
import { SpaceFeature, SpaceFeatureEnum, SpaceLanguage, SpaceModule, SpaceModuleEnum } from "@/models/space"
import { apiClient } from "@/networking/ApiClient"
import { useSpaces } from "@/networking/hooks/spaces"
import { useAppStore } from "@/stores/appStore"
import { APP_VERSION } from "@/version"
import { Box, Button, Center, HStack, Heading, Spinner, VStack, useToast } from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { z } from "zod"

export default function Home({ params }: { params: { spaceid: string } }) {
    const queryClient = useQueryClient()
    const toast = useToast()
    const [saveLoading, setSaveLoading] = useState<boolean>(false)
    const [spaceName, setSpaceName] = useState<string>("")
    const [spaceId, setSpaceId] = useState<string>("")
    const languageOptions = getAllLangauges().map((l) => ({ key: l.code, text: l.name }))
    const [language, setLanguage] = useState<SpaceLanguage>("en")
    const [openAccess, setOpenAccess] = useState<boolean>(true)
    const [mode, setMode] = useState<"loading" | "list" | "create">("loading")
    const [modules, setModules] = useState<SpaceModule[]>([])
    const [userFeatures, setUserFeatures] = useState<SpaceFeature[]>([])
    const { spaces } = useSpaces({})
    const { setSettingsMenu } = useAppStore((state) => state)
    useEffect(() => {
        setSettingsMenu("main")
    }, [])

    useEffect(() => {
        if (!spaces) return
        const space = spaces.find((s) => s.spaceId === params.spaceid)
        if (!space) return
        setSpaceName(space.name)
        setSpaceId(space.spaceId)
        setLanguage(space.defaultLanguage)
        setModules(space.modules)
        setOpenAccess(space.contentAccess === "open")
        setUserFeatures(space.userFeatures)
        setMode("list")
    }, [spaces])
    return (
        <>
            {mode === "loading" && (
                <Center w="100%">
                    <Spinner size="xl" colorScheme="blue"></Spinner>
                </Center>
            )}

            {mode === "list" && (
                <VStack spacing={10} w="100%" maxW="900px" alignItems={"flex-start"}>
                    <HStack w="100%">
                        <Heading flex={1}>General settings</Heading>
                        <Button
                            colorScheme="green"
                            minW="150px"
                            isLoading={saveLoading}
                            onClick={async () => {
                                setSaveLoading(true)
                                try {
                                    const response = await apiClient.put<PutSpaceRequest, PutSpaceResponse>({
                                        path: `/space/${params.spaceid}`,
                                        isAuthRequired: true,
                                        body: {
                                            name: spaceName,
                                            defaultLanguage: language,
                                            contentAccess: openAccess ? "open" : "closed",
                                            modules,
                                            userFeatures,
                                        },
                                    })

                                    setSaveLoading(false)
                                    queryClient.invalidateQueries(["spaces"])

                                    toast({
                                        title: "Settings saved",
                                        status: "success",
                                        position: "bottom-right",
                                    })
                                } catch (ex) {
                                    toast({
                                        title: "Could not save space",
                                        description: "Please check your data and try again.",
                                        status: "error",
                                        position: "bottom-right",
                                    })
                                    setSaveLoading(false)
                                }
                            }}
                        >
                            SAVE
                        </Button>
                    </HStack>
                    <Box bg="#fff" p={10} w="100%">
                        <VStack spacing={10} alignItems={"flex-start"}>
                            <HStack w="100%">
                                <Box w="60%">
                                    <TextInput value={spaceName} validate={z.string().min(3)} onChange={setSpaceName} subject="Space name"></TextInput>
                                </Box>
                                <Box w="40%">
                                    <TextInput value={spaceId} subject="spaceId" disabled={true} enableCopy={true}></TextInput>
                                </Box>
                            </HStack>

                            <TextInput
                                value={language}
                                onChange={(value) => setLanguage(value as SpaceLanguage)}
                                options={languageOptions}
                                type="select"
                                subject="Default language"
                            ></TextInput>

                            <CheckboxInput
                                checked={openAccess}
                                subject="Content access"
                                onChange={setOpenAccess}
                                checkedBody={<Box>All content is accessible without any authentification</Box>}
                                uncheckedBody={<Box>Content can only be accessed via access keys.</Box>}
                            ></CheckboxInput>
                            <VStack w="100%" alignItems={"flex-start"}>
                                <Box>User enabled features</Box>
                                <CheckboxList
                                    options={Object.values(SpaceFeatureEnum.Values).map((m) => ({
                                        key: m,
                                        text: m,
                                    }))}
                                    value={userFeatures}
                                    onChange={(features) => { setUserFeatures(features as SpaceFeature[])}}
                                ></CheckboxList>
                            </VStack>
                            <VStack w="100%" alignItems={"flex-start"}>
                                <Box>Modules</Box>
                                <CheckboxList
                                    options={SpaceModules.map((m) => ({
                                        key: m.id,
                                        text: m.name,
                                    }))}
                                    value={modules}
                                    onChange={(modules) => { setModules(modules as SpaceModule[])}}
                                ></CheckboxList>
                            </VStack>

                            <TextInput value={APP_VERSION} type="text" disabled={true} subject="Frank Version"></TextInput>
                        </VStack>
                    </Box>
                </VStack>
            )}
        </>
    )
}
