import { Box, Button, VStack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export function AdminMenu({ml = 10, onHideOverlay} : { ml? : number, onHideOverlay? : () => void}){
    const router = useRouter();
    return <VStack alignItems={"flex-start"} ml={ml} justifyContent={"flex-start"}>
    <Box px={2}>
        <Box fontWeight={"bold"} pt={2}>SYSTEM</Box>
    </Box>
    <Button variant={"ghost"} p={2} color="blue.500" onClick={()=>{
        onHideOverlay && onHideOverlay()
        router.push("/portal/users")
    }}>ALL USERS</Button>
        <Button variant={"ghost"} p={2} color="blue.500" onClick={()=>{
        onHideOverlay && onHideOverlay()
        router.push("/portal/spaces")
    }}>ALL SPACES</Button>    
</VStack>
}