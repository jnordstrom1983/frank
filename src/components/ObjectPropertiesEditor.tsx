import { Box, Button, Divider, HStack, VStack } from "@chakra-ui/react"
import TextInput from "./TextInput"
import { useEffect, useState } from "react"
import { OptionsEditor } from "./OptionsEditor"
import { ObjectProperty, ObjectPropertyEditor } from "./ObjectPropertyEditor"
import shortUUID from "short-uuid"
import { Divide } from "react-feather"


export function ObjectPropertiesEditor({ subject, properties, onChange }: { subject: string, properties: ObjectProperty[], onChange: (properties: ObjectProperty[]) => void }) {
    const [internalProperties, setInternalProperties] = useState<ObjectProperty[]>(properties)







    return <VStack w="100%" alignItems={"flex-start"}>
        <Box>{subject}</Box>
        <HStack alignItems={"flex-start"} w="100%">
            <Box w="200px" fontSize="14px" >
                Field Id
            </Box>
            <Box fontSize="14px" >Validation (Leave empty to allow any value)</Box>
        </HStack>
        <VStack w="100%" divider={<Divider></Divider>}>
            {internalProperties.map(p => {
                return <ObjectPropertyEditor key={p.id} id={p.id} propertyKey={p.key} options={p.options} onChange={(key, options) => {
                    let properties = [...internalProperties]
                    const index = properties.findIndex(prop => prop.id === p.id);
                    properties[index].key = key;
                    properties[index].options = options;
                    setInternalProperties(properties);
                    onChange(properties)
                }}
                    onDelete={() => {
                        let properties = [...internalProperties].filter(prop => prop.id !== p.id)
                        setInternalProperties(properties);
                        onChange(properties)
                    }}

                ></ObjectPropertyEditor>

            })}
        </VStack>

        <Button onClick={() => {
            let properties: ObjectProperty[] = [...internalProperties, { id: shortUUID.generate(), key: "", options: [] }]
            setInternalProperties(properties)
            onChange(properties)
        }}>Add property</Button>

    </VStack>




}