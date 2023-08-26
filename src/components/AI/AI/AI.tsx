import { ContentData } from "@/models/contentdata"
import { Space, SpaceLanguage, SpaceLanguageEnum } from "@/models/space"
import { useSpaces } from "@/networking/hooks/spaces"
import { Box, Button, Container, Flex, HStack, Heading, Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay, Spinner, Table, Tbody, Td, Th, Thead, Tr, VStack, useToast } from "@chakra-ui/react"
import { ReactElement, useEffect, useState } from "react"
import { Layers, X } from "react-feather"
import internal from "stream"
import { z } from "zod"
import { CheckboxInput } from "../../CheckboxInput"
import { ContentType } from "@/models/contentype"
import { SimpleCheckboxInput } from "../../SimpleCheckbox"
import { dataTypes } from "@/lib/constants"
import { AIModule } from "@/models/ai"
import { apiClient } from "@/networking/ApiClient"
import { PostAIRequest, PostAIResponse } from "@/app/api/space/[spaceid]/ai/post"
import { GetAITaskItemResponse } from "@/app/api/space/[spaceid]/ai/task/[taskid]/get"
import { AICheck } from "./AICheck"
import { AITranslate } from "./AITranslate"
import { AIReprahse } from "./AIRephrase"

export type AIState = "loading" | "prepare" | "processing" | "done"

export function AI({
    datas,
    language,
    module,
    spaceId,
    contentType,
    onClose,
    updateDatas,
}: {
    datas: ContentData[]
    contentType: ContentType
    language: SpaceLanguage
    module: AIModule
    spaceId: string
    onClose: () => void,
    updateDatas : (datas : ContentData[]) => void
}) {
    const [state, setState] = useState<AIState>("loading")
    const [taskDescription, setTaskDescription] = useState<ReactElement>()
    const toast = useToast()

    const [taskTitle, setTaskTitle] = useState<string>("")
    const [taskId, setTaskId] = useState<string>("")
    const [ready, setReady] = useState<boolean>(false)
    const [result, setResult] = useState<Record<string, any> | undefined>(undefined)
    useEffect(() => {
        if (!taskId) return

        const int = setInterval(async () => {
            
            try{
                const response = await apiClient.get<GetAITaskItemResponse>({
                    path: `/space/${spaceId}/ai/task/${taskId}`,
                    isAuthRequired: true,
                })
                if(response.state === "done"){
                    setResult(response.result!)
                    setState("done")
                    clearInterval(int)
                }
                if(response.state === "error"){
                    toast({
                        title: "AI could not generate a response ",
                        status: "error",
                        position: "bottom-right"
                    })
                    setState("prepare")
                    clearInterval(int)
                }
            
                
            }catch(ex){


            }

            
        }, 2000)
        return () => {
            clearInterval(int)
        }
    }, [taskId])

    return (
        <>
            <Modal isOpen={true} onClose={onClose} isCentered={true}>
            <ModalOverlay />
            <ModalContent maxW="800px" w="90%" maxH="90%">
      
                <ModalCloseButton right={10} top={10} />


                <ModalBody overflow="auto" p={20}>


                
                        <VStack flex={1} alignItems="flex-start" spacing={5}>

                             
                    <HStack spacing={10} w="100%" alignItems={"center"}>
                        <Box>
                            <img src="/static/ai.svg" width="64px"></img>
                        </Box>


                            <Heading>{taskTitle}</Heading>
                            </HStack>


                            {module === "check" && 
                                <AICheck
                                    datas={datas}
                                    language={language}
                                    spaceId={spaceId}
                                    setTaskDescription={setTaskDescription}
                                    contentType={contentType}
                                    setTaskTitle={setTaskTitle}
                                    state={state}
                                    setState={setState}
                                    onClose={onClose}
                                    setReady={setReady}
                                    setTaskId={setTaskId}
                                    result={result}
                                    updateDatas={updateDatas}
                                ></AICheck>
                            }

                            {module === "translate" && 
                                <AITranslate
                                    datas={datas}
                                    language={language}
                                    spaceId={spaceId}
                                    setTaskDescription={setTaskDescription}
                                    contentType={contentType}
                                    setTaskTitle={setTaskTitle}
                                    state={state}
                                    setState={setState}
                                    onClose={onClose}
                                    setReady={setReady}
                                    setTaskId={setTaskId}
                                    result={result}
                                    updateDatas={updateDatas}
                                ></AITranslate>
                            }       

                            {module === "reprahse" && 
                                <AIReprahse
                                    datas={datas}
                                    language={language}
                                    spaceId={spaceId}
                                    setTaskDescription={setTaskDescription}
                                    contentType={contentType}
                                    setTaskTitle={setTaskTitle}
                                    state={state}
                                    setState={setState}
                                    onClose={onClose}
                                    setReady={setReady}
                                    setTaskId={setTaskId}
                                    result={result}
                                    updateDatas={updateDatas}
                                ></AIReprahse>
                            }                                                   

                            {state === "loading" && (
                                <Box backgroundColor="#F8F8F8" borderRadius="15px" padding={10} w="100%">
                                    <HStack spacing={10} width="100%">
                                        <VStack flex={1} alignItems={"flex-start"}>
                                            <Box>Preparing, please wait...</Box>
                                        </VStack>
                                        <Box>
                                            <Spinner colorScheme="blue" size="lg"></Spinner>
                                        </Box>
                                    </HStack>
                                </Box>
                            )}

                            {state === "prepare" && (
                                <Box backgroundColor="#F8F8F8" borderRadius="15px" padding={10} w="100%">
                                    <HStack spacing={10} width="100%">
                                        <VStack flex={1} alignItems={"flex-start"}>
                                            <Box fontSize="20px">AI Task</Box>
                                            <Box>{taskDescription}</Box>
                                        </VStack>
                                        <Button
                                            colorScheme="green"
                                            isDisabled={!ready}
                                            onClick={() => {
                                                setState("processing")
                                            }}
                                        >
                                            START
                                        </Button>
                                    </HStack>
                                </Box>
                            )}

                            {state === "processing" && (
                                <Box backgroundColor="#F8F8F8" borderRadius="15px" padding={10} w="100%">
                                    <HStack spacing={10} width="100%">
                                        <VStack flex={1} alignItems={"flex-start"}>
                                            <Box>Processing, please wait...</Box>
                                        </VStack>
                                        <Box>
                                            <Spinner colorScheme="blue" size="lg"></Spinner>
                                        </Box>
                                    </HStack>
                                </Box>
                            )}
                        </VStack>
                    
                </ModalBody>
                </ModalContent>
                </Modal>
        </>
    )
}


