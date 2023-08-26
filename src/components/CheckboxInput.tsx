import { Box, HStack, Switch, VStack } from "@chakra-ui/react"
import { useEffect, useState } from "react"

export  function CheckboxInput({
    checked,
    subject,
    uncheckedBody,
    checkedBody,
    onChange,
    align = "center",
}: {
    subject?: string
    checked: boolean
    uncheckedBody?: React.ReactNode
    checkedBody?: React.ReactNode
    onChange?: (checked: boolean) => void,
    align? : "top" | "center"
}) {
    const [internalChecked, setInternalChecked] = useState<boolean>(checked)
    useEffect(()=>{
        setInternalChecked(checked)
    }, [checked])
    return (

        <VStack alignItems={"flex-start"} w="100%" mt={1}>
            {subject && <Box>{subject}</Box>}
            <HStack w="100%" spacing={5} alignItems={align === "top" ? "flex-start" : "center"}>
                <Box>
                <Switch
                    mt={-1}
                    colorScheme="blue"
                    isChecked={internalChecked}
                    size={"lg"}
                    onChange={() => {
                        setInternalChecked(!internalChecked)
                        onChange && onChange(!internalChecked);
                    }}
                ></Switch>
                </Box>
                <Box w="100%">{uncheckedBody && checkedBody ? (internalChecked ? checkedBody : uncheckedBody) : uncheckedBody}</Box>
            </HStack>
        </VStack>
    )
}
