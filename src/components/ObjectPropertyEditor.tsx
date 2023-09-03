import { Box, Button, HStack, Menu, MenuButton, MenuItem, MenuList, VStack } from "@chakra-ui/react"
import TextInput from "./TextInput"
import { useEffect, useState } from "react"
import { OptionsEditor } from "./OptionsEditor"
import { MinusCircle, Trash } from "react-feather"

export interface ObjectProperty {
    id: string,
    key: string,
    options: string[]
}
export function ObjectPropertyEditor({ id, propertyKey, options, onChange, onDelete }: { id: string, propertyKey: string, options: string[], onChange: (key: string, options: string[]) => void, onDelete: () => void }) {
    const [internalKey, setInternalKey] = useState<string>("")
    const [internalOptions, setInternalOptions] = useState<string[]>([]);

    useEffect(() => {
        setInternalKey(propertyKey)
    }, [propertyKey])

    useEffect(() => {
        setInternalOptions(options)
    }, [options])

    return <HStack alignItems={"flex-start"} w="100%">
        <Box w="200px">
            <TextInput value={internalKey} onChange={(key) => {
                setInternalKey(key);
                onChange(key, internalOptions)
            }}></TextInput>
        </Box>
        <VStack flex={1} alignItems={"flex-start"}>
            <OptionsEditor options={internalOptions} type="string" onChange={(options) => {
                setInternalOptions(options as string[])
                onChange(internalKey, options as string[])
            }}></OptionsEditor>

        </VStack>

        <Menu placement="auto-end">
            {({ isOpen }) => (
                <>
                    <MenuButton isActive={isOpen} as={Button} variant={"ghost"}>
                        <MinusCircle ></MinusCircle>
                    </MenuButton>

                    <MenuList>
                        <MenuItem
                            color="red.500"
                            onClick={async () => {

                                onDelete()

                            }}
                        >
                            Delete property
                        </MenuItem>
                    </MenuList>
                </>
            )}
        </Menu>



    </HStack>
}