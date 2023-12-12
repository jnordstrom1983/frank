import { usePhrases } from "@/lib/lang";
import { Box, Button, VStack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export function AdminMenu({ml = 10, onHideOverlay} : { ml? : number, onHideOverlay? : () => void}){
    const { t } = usePhrases();


    const router = useRouter();
    return <VStack alignItems={"flex-start"} ml={ml} justifyContent={"flex-start"}>
    <Box px={2}>
        <Box fontWeight={"bold"} pt={2}>{t("layout_adminmenu_system")}</Box>
    </Box>
    <Button variant={"ghost"} p={2} color="blue.500" onClick={()=>{
        onHideOverlay && onHideOverlay()
        router.push("/portal/users")
    }}>{t("layout_adminmenu_allusers")}</Button>
        <Button variant={"ghost"} p={2} color="blue.500" onClick={()=>{
        onHideOverlay && onHideOverlay()
        router.push("/portal/spaces")
    }}>{t("layout_adminmenu_allspaces")}</Button>    
</VStack>
}