"use client"


import {
    Box,
    Button,
    HStack,
    VStack
} from "@chakra-ui/react"
import { Sliders } from "react-feather"
export type FilterItem = { id: string; name: string }
export function SelectionList({
    subject,
    items,
    selectedItemId = "",
    anyText = "",
    onSettings,
    onClick,
    minElements = 2,
}: {
    subject: string
    items: FilterItem[]
    selectedItemId: string
    anyText?: string
    onSettings?: () => void
    onClick?: (itemId: string) => void
    minElements? : number
}) {
    if (!onSettings && selectedItemId === "" && items.length < minElements) return null
    const allItems: FilterItem[] = anyText ? [{ id: "", name: anyText }, ...items] : [...items]

    return (
        <VStack alignItems={"flex-start"} w="100%">
            {onSettings ? (
                <HStack w="100%">
                    <Box fontWeight={"bold"} flex={1}>
                        {subject}
                    </Box>
                    <Button variant="ghost" onClick={onSettings}>
                        <Sliders></Sliders>
                    </Button>
                </HStack>
            ) : (
                <Box fontWeight={"bold"} flex={1}>
                    {subject}
                </Box>
            )}

            {allItems.map((item) => {
                if (item.id === selectedItemId) {
                    return (
                        <Button
                            variant={"ghost"}
                            key={item.id ? item.id : "all"}
                            fontWeight={"bold"}
                            bg="blue.500"
                            color="white"
                            padding="2"
                            px={5}
                            borderRadius="25px"
                            fontSize={"14px"}
                            _hover={{ opacity: 0.8 }}
                            onClick={() => onClick && onClick(item.id)}
                        >
                            {item.name}
                        </Button>
                    )
                } else {
                    return (
                        <Button variant={"ghost"} key={item.id ? item.id : "all"} fontSize={"14px"}  borderRadius="25px" color="gray.600" onClick={() => onClick && onClick(item.id)}>
                            {item.name}
                        </Button>
                    )
                }
            })}
        </VStack>
    )
}
