import { FieldOption } from "@/models/field";
import { Box, Button, Flex, HStack, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ZodString, z } from "zod";
import TextInput from "./TextInput";
import { X } from "react-feather";

export function OptionsEditor({options, type, onChange, subject} : { options : FieldOption[], type : "string" | "number", onChange : (options : FieldOption[]) => void, subject? : string }){
    
    const [valid, setValid] = useState<boolean>(true) 
    const [internalValue, setInternalValue] = useState<string>("");
    const [internalOptions, setInternalOptions] = useState<FieldOption[]>(options)
    useEffect(()=>{
        setInternalOptions(options)
        setInternalValue("")
    }, [options])
    function onSubmit(value : string){
        if(!valid) return
        if(!value) return;
        if(internalOptions.includes(value)) return;
        let newOptions = [...internalOptions, value];
        if(type === "number"){
            newOptions = [...internalOptions, parseInt(value)];
        }

        
        setInternalOptions(newOptions);
        setInternalValue("")
        onChange(newOptions)
    }
    function removeOption(option : FieldOption){
        const newOptions = [...internalOptions].filter(o=>o!==option)
        setInternalOptions(newOptions);
        onChange(newOptions)
    }

    let validator : ZodString = z.string().max(64)
    if(type == "number") {
        validator = z.string().regex(/^\d+$/)
    }

    return <VStack w="100%" alignItems={"flex-start"}>
        <TextInput value={internalValue} subject={subject} placeholder="Enter value and press enter to add to list of accepted values" onChange={setInternalValue} onSubmit={onSubmit} validate={validator}  onValidation={setValid}></TextInput>
        <Flex flexWrap={"wrap"} gap={5} >
            {internalOptions.map(o=><Box bg="gray.100" p={1} fontSize="12px"  key={o}>
                <HStack spacing={1} w="100%">
                    <Box pl={3}>{o}</Box>
                    <Button variant={"ghost"} onClick={()=>{
                        removeOption(o)
                    }}>
                        <X size="16px"></X>
                    </Button>
                </HStack>
            </Box>)}

        </Flex>
    </VStack>


}