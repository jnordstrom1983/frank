"use client"
import TextInput from "@/components/TextInput"
import { dataTypes } from "@/lib/constants"
import { camelize } from "@/lib/utils"
import { Field, FieldValidators } from "@/models/field"
import { Box, Button, HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Radio, RadioGroup, Tag, VStack } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { z } from "zod"

export function CreateField({ isOpen, onClose, fields, onFieldAdded }: { isOpen: boolean; onClose: () => void; fields: Field[]; onFieldAdded: (field: Field) => void }) {
    const [name, setName] = useState<string>("")
    const [dataTypeValue, setDataType] = useState<string>("string")
    const [variant, setVariant] = useState<string>("")
    const [fieldId, setFieldId] = useState<string>("")
    const [nameValid, setNameValid] = useState<boolean>(false)

    useEffect(() => {
        const typeObject = dataTypes.find((t) => t.id === dataTypeValue)
        if (typeObject) {
            setVariant(typeObject.variants[0].id)
        }
    }, [dataTypeValue])

    function nameChanged(value: string) {
        setName(value)
        let id = camelize(value)
        let existing = fields.find((p) => p.fieldId === id)
        let cnt = 1
        while (existing) {
            cnt++
            id = camelize(`${value}${cnt}`)
            existing = fields.find((p) => p.fieldId === id)
        }
        setFieldId(id)
    }

    const typesItems = dataTypes.map((t) => ({
        key: t.id,
        text: t.name,
    }))

    const typeObject = dataTypes.find((t) => t.id === dataTypeValue)



    function addField() {
        if (!nameValid) return
        const variantObject = typeObject?.variants.find((v) => v.id == variant)
        if (!variantObject) return

        let validators: FieldValidators = {}
        Object.keys(variantObject.validators).forEach((key) => {
            //@ts-ignore
            let validator = variantObject.validators[key] as any
            //@ts-ignore
            validators[key] = { ...validator }
        })

        if (validators.required !== undefined && variantObject.canBeTitle && fields.length === 0) {
            validators.required.enabled = true
        }

        const field: Field = {
            fieldId: fieldId,
            dataTypeId: dataTypeValue,
            dataTypeVariantId: variant,
            name: name,
            description: "",
            title: variantObject.canBeTitle ? fields.length === 0 : false,
            validators,
            options: variantObject.options === "mandatory" ? [] : undefined,
            settings: [],
        }
        onFieldAdded(field)
        onClose()
        setName("")
        setFieldId("")
        setDataType("string")
        setVariant("textbox")
    }

    useEffect(() => {
        const obj = dataTypes.find((t) => t.id === dataTypeValue)
        setVariant(obj?.variants[0].id || "")
    }, [dataTypeValue])
    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered={true}>
            <ModalOverlay />
            <ModalContent maxW="800px">
                <ModalHeader pt={10} px={10} pb={0}>
                    Add new field
                </ModalHeader>
                <ModalCloseButton right={10} top={10} />
                <ModalBody minH="400px" maxH="90vh" overflow="auto" p={10}>
                    <HStack alignItems={"flex-start"} spacing={10}>
                        <VStack w="50%" alignItems={"flex-start"} spacing={8}>
                            <TextInput
                                subject="Name"
                                placeholder="My new field"
                                value={name}
                                focus={true}
                                onChange={nameChanged}
                                validate={z.string().min(3)}
                                onValidation={(valid) => {
                                    setNameValid(valid)
                                }}
                            ></TextInput>
                            <TextInput subject="fieldId" disabled={true} value={fieldId}></TextInput>
                        </VStack>
                        <Box overflowY={"auto"} maxH="60vh" w="50%">
                            <Box>Data type</Box>
                            <RadioGroup defaultValue={dataTypeValue} onChange={setDataType}>
                                <VStack w="100%" alignItems={"flex-start"}>
                                    {dataTypes.map(type => {
                                        return <Box key={type.id} backgroundColor={dataTypeValue === type.id ? "#F1F1F1" : undefined} p="3" paddingLeft={6} w="100%">
                                            <Radio value={type.id} w="100%">
                                                <VStack spacing={1} paddingLeft={3} w="100%" alignItems={"flex-start"}>
                                                    <Box>{type.name}</Box>
                                                    <Box fontSize="13px" color="gray.500">{type.description}</Box>
                                                    {type.variants.length > 1 && <HStack>
                                                        {type.variants.map(v => {
                                                            return <Tag key={v.id} colorScheme="blue">{v.name}</Tag>
                                                        })}
                                                    </HStack>}
                                                </VStack>
                                            </Radio>
                                        </Box>
                                    })}


                                </VStack>
                            </RadioGroup>

                        </Box>


                    </HStack>
                </ModalBody>

                <ModalFooter pb={10} px={10} gap={10}>
                    <Button
                        colorScheme="green"
                        mr={3}
                        minW="150px"
                        onClick={() => {
                            addField()
                        }}
                        isDisabled={!nameValid}
                    >
                        Add and configure
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            setName("")
                            setFieldId("")
                            setDataType("string")
                            setVariant("textbox")
                            onClose()
                        }}
                    >
                        Cancel
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
