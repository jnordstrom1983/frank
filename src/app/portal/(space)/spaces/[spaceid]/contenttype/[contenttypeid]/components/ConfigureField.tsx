"use client"
import { CheckboxInput } from "@/components/CheckboxInput"
import { MaxLengthEditor, } from "@/components/FieldValidators/MaxLength"
import { MinLengthEditor } from "@/components/FieldValidators/MinLength"
import { RequiredEditor } from "@/components/FieldValidators/Required"
import { UniqueEditor } from "@/components/FieldValidators/Unique"
import { MaxLengthValidatorProperties } from "@/components/FieldValidators/MaxLengthUtils"
import { MinLengthValidatorProperties } from "@/components/FieldValidators/MinLengthUtils"
import { RequiredValidatorProperties } from "@/components/FieldValidators/RequiredUtils"
import { UniqueValidatorProperties } from "@/components/FieldValidators/UniqueSchemas"

import { OptionsEditor } from "@/components/OptionsEditor"
import { SimpleCheckboxInput } from "@/components/SimpleCheckbox"
import TextInput from "@/components/TextInput"
import { dataTypes } from "@/lib/constants"
import { Field, FieldOption, FieldSetting, FieldValidators } from "@/models/field"
import { Box, Button, HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, useDisclosure, VStack } from "@chakra-ui/react"
import React, { useEffect, useState } from "react"
import { Trash } from "react-feather"
import { z } from "zod"
import { MinValueEditor } from "@/components/FieldValidators/MinValue"
import { MaxValueEditor } from "@/components/FieldValidators/MaxValue"
import { MinValueValidatorProperties } from "@/components/FieldValidators/MinValueUtils"
import { MaxValueValidatorProperties } from "@/components/FieldValidators/MaxValueUtils"
import { useContenttype, useContentypes } from "@/networking/hooks/contenttypes"
import { CheckboxList } from "@/components/CheckboxList"

export function ConfigureField({
    isOpen,
    onClose,
    fields,
    field,
    onFieldUpdated,
    onDeleteField,
    spaceId
}: {
    isOpen: boolean
    onClose: () => void
    fields: Field[]
    field: Field
    spaceId: string
    onFieldUpdated: (field: Field) => void
    onDeleteField: (field: Field) => void

}) {
    const [name, setName] = useState<string>("")
    const [description, setDescription] = useState<string>("")
    const [descriptionValid, setDescriptionValid] = useState<boolean>(true)
    const [title, setTitle] = useState<boolean>(false)
    const [variant, setVariant] = useState<string>("")
    const [nameValid, setNameValid] = useState<boolean>(false)
    const [isValid, setIsValid] = useState<boolean>(true)
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()


    const [validatorRequired, setValidatorRequired] = useState<RequiredValidatorProperties | undefined>()
    const [validatorUnique, setValidatorUnique] = useState<UniqueValidatorProperties | undefined>()
    const [validatorMaxLenghtValid, setValidatorMaxLenghtValid] = useState<boolean>(true)
    const [validatorMaxLenght, setValidatorMaxLenght] = useState<MaxLengthValidatorProperties | undefined>()
    const [validatorMinLenghtValid, setValidatorMinLenghtValid] = useState<boolean>(true)
    const [validatorMinLenght, setValidatorMinLenght] = useState<MinLengthValidatorProperties | undefined>()
    const [validatorMaxValueValid, setValidatorMaxValueValid] = useState<boolean>(true)
    const [validatorMaxValue, setValidatorMaxValue] = useState<MaxValueValidatorProperties | undefined>()
    const [validatorMinValueValid, setValidatorMinValueValid] = useState<boolean>(true)
    const [validatorMinValue, setValidatorMinValue] = useState<MinValueValidatorProperties | undefined>()
    const [settings, setSettings] = useState<FieldSetting[]>([])
    const [options, setOptions] = useState<FieldOption[]>([])
    const [optionsEnabled, setOptionsEnabled] = useState<boolean>(false)
    const typeObject = dataTypes.find((t) => t.id === field.dataTypeId)!
    const variantObject = typeObject.variants.find((v) => v.id === variant)
    const variantItems =
        typeObject?.variants.map((v) => ({
            key: v.id,
            text: v.name,
        })) || []

    function mergeValidators(variantId: string) {
        const variantObject = typeObject.variants.find((v) => v.id == variantId)
        const validators: FieldValidators = {}
        if (!variantObject) return
        Object.keys(variantObject.validators).forEach((key) => {
            //@ts-ignore
            if (variantObject.validators[key]) {
                //@ts-ignore
                if (field.validators[key]) {
                    //@ts-ignore
                    validators[key] = field.validators[key]
                } else {
                    //@ts-ignore
                    validators[key] = variantObject.validators[key]
                }
            }
        })

        setValidatorRequired(validators.required)
        setValidatorUnique(validators.unique)
        setValidatorMaxLenght(validators.maxLength)
        setValidatorMinLenght(validators.minLength)
        setValidatorMaxValue(validators.maxValue)
        setValidatorMinValue(validators.minValue)

    }

    useEffect(() => {
        setIsValid(true)
        setValidatorMaxLenghtValid(true)
        setValidatorMinLenghtValid(true)
        setValidatorMaxValueValid(true)
        setValidatorMinValueValid(true)

        setName(field.name)
        setDescription(field.description)
        setTitle(field.title)
        setVariant(field.dataTypeVariantId)
        mergeValidators(field.dataTypeVariantId)
        setSettings(field.settings)
        setOptions(field.options || [])
        setOptionsEnabled(!!field.options)
    }, [field])
    useEffect(() => {
        mergeValidators(variant)
    }, [variant])

    useEffect(() => {
        const valid = nameValid && descriptionValid && validatorMaxLenghtValid && validatorMinLenghtValid && validatorMaxValueValid && validatorMinValueValid
        setIsValid(valid)
    }, [nameValid, descriptionValid, validatorMaxLenghtValid, validatorMinLenghtValid])

    function setSettingValue(id: string, value: any) {
        const index = settings.findIndex((s) => s.id == id)
        if (index === -1) {
            setSettings([...settings, { id, value }])
        } else {
            const updatedSettings = [...settings]
            updatedSettings[index].value = value
            setSettings(updatedSettings)
        }
    }


    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} isCentered={true}>
                <ModalOverlay />
                <ModalContent maxW="1000px" maxH="90vh">
                    <ModalHeader pt={10} px={10} pb={0}>
                        Configure field
                    </ModalHeader>
                    <Button onClick={onDeleteOpen} variant="ghost" position="absolute" right={5} top={10} color={"gray"} _hover={{ color: "red.500" }}>
                        <Trash size={32}></Trash>
                    </Button>

                    <ModalBody minH="400px" overflow="auto" p={10}>
                        <HStack alignItems={"flex-start"} spacing={10}>
                            <VStack w="70%" alignItems={"flex-start"} spacing={8}>
                                <TextInput
                                    subject="Name"
                                    placeholder="My new field"
                                    value={name}
                                    focus={true}
                                    onChange={setName}
                                    validate={z.string().min(3)}
                                    onValidation={(valid) => {
                                        setNameValid(valid)
                                    }}
                                ></TextInput>
                                {variantItems.length > 1 && <TextInput subject="Variant" value={variant} onChange={setVariant} type="select" options={variantItems}></TextInput>}
                                <TextInput
                                    subject="Help text"
                                    placeholder="This field is used for..."
                                    value={description}
                                    onChange={setDescription}
                                    validate={z.string().max(255)}
                                    onValidation={(valid) => {
                                        setDescriptionValid(valid)
                                    }}
                                ></TextInput>

                                {variantObject?.settings.map((setting) => {
                                    const existingValue = field.settings.find((p) => p.id === setting.id)?.value
                                    switch (setting.type) {
                                        case "textbox":
                                            return (
                                                <TextInput
                                                    key={`setting_${setting.id}`}
                                                    subject={setting.name}
                                                    value={existingValue || ""}
                                                    onChange={(value) => setSettingValue(setting.id, value)}
                                                    validate={z.string().max(25)}
                                                    onValidation={(valid) => {
                                                        setDescriptionValid(valid)
                                                    }}
                                                ></TextInput>
                                            )
                                        case "checkbox":
                                            return (
                                                <SimpleCheckboxInput
                                                    key={`setting_${setting.id}`}
                                                    subject={setting.name}
                                                    checked={existingValue === undefined ? setting.data?.checked || false : existingValue}
                                                    onChange={(checked) => setSettingValue(setting.id, checked)}
                                                    description={setting.data?.description}

                                                ></SimpleCheckboxInput>
                                            )
                                        case "checkboxes":
                                            return <VStack w="100%" alignItems="flex-start" key={`setting_${setting.id}`}>
                                                <Box>{setting.name}</Box>
                                                <CheckboxList options={setting.data.items} defaultValue={setting.data.items.map((m: any) => m.key)} onChange={(value) => setSettingValue(setting.id, value)} value={existingValue} ></CheckboxList>
                                            </VStack>


                                        case "contenttypes":
                                            return <ContentTypeSelector key={`setting_${setting.id}`} subject={setting.name} all={setting.data?.all} multiple={true} selected={existingValue === undefined ? setting.data?.value || false : existingValue as string[]} spaceId={spaceId} onChange={(selected) => {
                                                setSettingValue(setting.id, selected)
                                            }}></ContentTypeSelector>

                                        case "checkboxInput":
                                            return (
                                                <CheckboxInput
                                                    key={`setting_${setting.id}`}
                                                    subject={setting.name}
                                                    checked={existingValue === undefined ? false : true}
                                                    onChange={(checked) => { if (!checked) setSettingValue(setting.id, undefined) }}
                                                    checkedBody={<TextInput description={setting.data?.description} value={existingValue === undefined ? 0 : existingValue} type="text" onChange={(value) => setSettingValue(setting.id, value)}></TextInput>}
                                                    uncheckedBody={<Box></Box>}

                                                ></CheckboxInput>
                                            )

                                    }
                                    return null
                                })}

                                {variantObject?.options === "mandatory" && (
                                    <OptionsEditor subject="Accepted values" options={options} onChange={setOptions} type={variantObject.optionsType || "string"}></OptionsEditor>
                                )}
                                {variantObject?.options === "enabled" && (
                                    <CheckboxInput
                                        subject="Accepted values"
                                        checked={optionsEnabled}
                                        onChange={(checked) => {
                                            setOptionsEnabled(checked)
                                        }}
                                        uncheckedBody={
                                            <Box
                                                fontSize="14px"
                                                color={"gray.500"}
                                                onClick={() => {
                                                    setOptionsEnabled(!optionsEnabled)
                                                }}
                                            >
                                                Only allow specified values
                                            </Box>
                                        }
                                        checkedBody={
                                            <Box w="100%">
                                                <OptionsEditor options={options} onChange={setOptions} type={variantObject.optionsType || "string"}></OptionsEditor>
                                            </Box>
                                        }
                                    ></CheckboxInput>
                                )}
                                {variantObject?.canBeTitle && <SimpleCheckboxInput subject="Title" checked={title} onChange={setTitle} description="This field represents title of the content"></SimpleCheckboxInput>}


                                {validatorRequired && <RequiredEditor settings={validatorRequired} onUpdate={setValidatorRequired}></RequiredEditor>}

                                {validatorUnique && <UniqueEditor settings={validatorUnique} onUpdate={setValidatorUnique}></UniqueEditor>}
                                {validatorMinLenght && (
                                    <MinLengthEditor settings={validatorMinLenght} onUpdate={setValidatorMinLenght} onValidation={setValidatorMinLenghtValid}></MinLengthEditor>
                                )}
                                {validatorMaxLenght && (
                                    <MaxLengthEditor settings={validatorMaxLenght} onUpdate={setValidatorMaxLenght} onValidation={setValidatorMaxLenghtValid}></MaxLengthEditor>
                                )}
                                {validatorMinValue && (
                                    <MinValueEditor settings={validatorMinValue} onUpdate={setValidatorMinValue} onValidation={setValidatorMinValueValid}></MinValueEditor>
                                )}
                                {validatorMaxValue && (
                                    <MaxValueEditor settings={validatorMaxValue} onUpdate={setValidatorMaxValue} onValidation={setValidatorMaxValueValid}></MaxValueEditor>
                                )}
                            </VStack>
                            <VStack w="30%" alignItems={"flex-start"} spacing={10}>
                                <TextInput subject="fieldId" disabled={true} value={field.fieldId}></TextInput>
                                <TextInput subject="Data type" disabled={true} value={typeObject.name}></TextInput>
                            </VStack>
                        </HStack>
                    </ModalBody>

                    <ModalFooter pb={10} px={10} gap={10}>
                        <Button
                            colorScheme="green"
                            mr={3}
                            minW="150px"
                            onClick={() => {
                                let validators: FieldValidators = {}
                                if (validatorRequired) {
                                    validators = { ...validators, required: validatorRequired }
                                }
                                if (validatorUnique) {
                                    validators = { ...validators, unique: validatorUnique }
                                }
                                if (validatorMinLenght) {
                                    validators = { ...validators, minLength: validatorMinLenght }
                                }
                                if (validatorMaxLenght) {
                                    validators = { ...validators, maxLength: validatorMaxLenght }
                                }
                                if (validatorMinValue) {
                                    validators = { ...validators, minValue: validatorMinValue }
                                }
                                if (validatorMaxValue) {
                                    validators = { ...validators, maxValue: validatorMaxValue }
                                }

                                const updated: Field = { ...field, name, title, dataTypeVariantId: variant, settings, description, options, validators }

                                if (variantObject?.options === "enabled") {
                                    if (!optionsEnabled) {
                                        delete updated.options
                                    }
                                }

                                onFieldUpdated(updated)
                                onClose()
                            }}
                            isDisabled={!isValid}
                        >
                            Update
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setName("")
                                setVariant("textbox")
                                onClose()
                            }}
                        >
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>


            <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered={true}>
                <ModalOverlay />
                <ModalContent maxW="500px">
                    <ModalHeader pt={10} px={10} pb={0}>
                        Remove field
                    </ModalHeader>
                    <ModalCloseButton right={10} top={10} />
                    <ModalBody overflow="auto" p={10}>
                        Are you suer you wish to remove this field?
                    </ModalBody>

                    <ModalFooter pb={10} px={10} gap={10}>
                        <Button
                            colorScheme="red"
                            mr={3}
                            minW="150px"
                            onClick={() => {
                                onDeleteField(field);
                                onClose();
                            }}
                            isDisabled={!nameValid}
                        >
                            Yes, remove
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => {

                                onDeleteClose()
                            }}
                        >
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}



function ContentTypeSelector({ spaceId, subject, selected, multiple = false, all = "", onChange }: { subject?: string, spaceId: string, multiple?: boolean, all?: string, selected: string[], onChange: (options: string[]) => void }) {
    const { contenttypes } = useContentypes(spaceId, {})
    const [internalSelected, setInternalSelected] = useState<string[]>(selected)
    if (!contenttypes) {
        return <VStack alignItems={"flex-start"}>
            {subject && <Box>{subject}</Box>}
            <Spinner></Spinner>
        </VStack>
    }


    return <VStack alignItems="flex-start">
        {subject && <Box>{subject}</Box>}
        {all && <SimpleCheckboxInput checked={internalSelected.includes("__all__")} description={all} onChange={(checked) => {
            if (checked) {

                setInternalSelected(["__all__"])
                onChange(["__all__"])
            } else {
                setInternalSelected(internalSelected.filter(s => s !== "__all__"))
                onChange(internalSelected.filter(s => s !== "__all__"))
            }

        }}></SimpleCheckboxInput>}
        {contenttypes.map(c => <SimpleCheckboxInput key={c.contentTypeId} checked={internalSelected.includes(c.contentTypeId)} description={c.name} onChange={(checked) => {
            if (!multiple) {
                let newValue: string[] = []
                if (checked) {
                    newValue = [c.contentTypeId]
                } else {
                    newValue = [""]
                }
                setInternalSelected(newValue)
                onChange(newValue)
                return
            }
            if (checked) {
                let newValue: string[] = [...internalSelected.filter(s => s !== "__all__" && s !== c.contentTypeId), c.contentTypeId]
                setInternalSelected(newValue)
                onChange(newValue)
            } else {
                let newValue: string[] = [...internalSelected.filter(s => s !== c.contentTypeId)]
                setInternalSelected(newValue)
            }

        }}></SimpleCheckboxInput>)}
    </VStack>



}