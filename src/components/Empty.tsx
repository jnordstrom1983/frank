import { Box, HStack, VStack } from "@chakra-ui/react"
import { Inbox } from "react-feather"

export function Empty({message = "No items found"}: { message? : string}) {
    return (
        <Box color="grey" backgroundColor={"gray.100"} fontSize="14px" w="100%">
            <HStack spacing="10" padding={5} w="100%">
                <Inbox size="26px"></Inbox>

                <Box>{message} </Box>
            </HStack>
        </Box>
    )
}
