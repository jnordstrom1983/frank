import { Box, Button, HStack, Input, Select, Textarea, Tooltip, VStack, useToast } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import CopyToClipboard from "react-copy-to-clipboard"
import { Copy } from "react-feather"
import { ZodEffects, ZodEnum, ZodOptional, ZodString } from "zod"
export default function TextInput({
    subject,
    placeholder,
    value,
    options = [],
    type = "text",
    height = "150px",
    disabled = false,
    focus = false,
    validate,
    onValidation,
    onChange,
    onSubmit,
    bg,
    description,
    showValidation = false,
    enableCopy = false,
    copyMessage 
}: {
    subject?: string | React.ReactNode
    placeholder?: string
    value: string
    height?: string
    type?: "text" | "password" | "select" | "textarea"
    options?: { key: string; text: string }[]
    disabled?: boolean
    focus?: boolean
    validate?: ZodString | ZodEnum<any> | ZodEffects<any> | ZodOptional<any>
    onValidation?: (valid: boolean) => void
    onChange?: (value: string) => void
    onSubmit?: (value: string) => void
    bg?: string
    description?: string
    showValidation?: boolean
    enableCopy? : boolean,
    copyMessage? : string
}) {
    const [internalValue, setInternalValue] = useState<string>(value)
    const [internalErrors, setInternalErrors] = useState<string[]>([])
    const toast = useToast();
    useEffect(() => {
        setInternalValue(value)
        validateData(value, true)
    }, [value])

    useEffect(() => {
        if (showValidation) {
            validateData(internalValue, false)
        } else {
            validateData(internalValue, true)
            setInternalErrors([])
        }
    }, [showValidation])
    function validateData(value: string, silent?: boolean) {
        if (!validate) {
            setInternalErrors([])
            onValidation && onValidation(true)
            return true
        }
        const validationResult = validate.safeParse(value)
        if (silent) {
            setInternalErrors([])
        } else {
            if (validationResult.success) {
                setInternalErrors([])
            } else {
                setInternalErrors(validationResult.error.errors.map((e: any) => e.message))
            }
        }
        onValidation && onValidation(validationResult.success)
        return validationResult.success
    }
    useEffect(() => {
        if (internalValue !== "") validateData(internalValue)
    }, [internalValue])
    return (
        <VStack alignItems={"flex-start"} w="100%">
            {(subject || internalErrors.length > 0) && (
                <HStack>
                    {subject && <Box>{subject}</Box>}
                    {internalErrors.map((e) => (
                        <Box key={e} bg="red.400" color="white" padding="3px" borderRadius="3px" fontSize="12px">
                            {e}
                        </Box>
                    ))}
                </HStack>
            )}
            {description && <Box color="gray.400" fontStyle="italic">{description}</Box>}
            {type === "select" ? (
                <Select
                    variant="unstyled"
                    placeholder={placeholder}
                    value={internalValue}
                    onChange={(ev) => {
                        setInternalValue(ev.currentTarget.value)
                        validateData(ev.currentTarget.value)
                        onChange && onChange(ev.currentTarget.value)
                    }}
                >
                    {options.map((o) => {
                        return (
                            <option value={o.key} key={o.key}>
                                {o.text}
                            </option>
                        )
                    })}
                </Select>
            ) : (

                type === "textarea" ? (<>
                    <Textarea autoFocus={focus} w="100%" bg={bg} height={height} disabled={disabled}
                        placeholder={placeholder}
                        value={internalValue}
                        onKeyDown={(ev) => {
                            if (ev.key == "Enter") {
                                if (!validateData(ev.currentTarget.value)) return
                                onSubmit && onSubmit(ev.currentTarget.value)
                            }
                        }}
                        onChange={(ev) => {
                            setInternalValue(ev.currentTarget.value)
                            validateData(ev.currentTarget.value)
                            onChange && onChange(ev.currentTarget.value)
                        }} ></Textarea>
                </>) : (


                    <HStack w="100%" alignItems={"flex-start"}>
                    <Input
                        type={type}
                        autoFocus={focus}
                        w="100%"
                        bg={bg}
                        disabled={disabled}
                        placeholder={placeholder}
                        value={internalValue}
                        onKeyDown={(ev) => {
                            if (ev.key == "Enter") {
                                if (!validateData(ev.currentTarget.value)) return
                                onSubmit && onSubmit(ev.currentTarget.value)
                            }
                        }}
                        onChange={(ev) => {
                            setInternalValue(ev.currentTarget.value)
                            validateData(ev.currentTarget.value)
                            onChange && onChange(ev.currentTarget.value)
                        }}
                    ></Input>
                           {enableCopy && <CopyToClipboard
                            text={internalValue}
                            onCopy={() =>
                                toast({
                                    title: copyMessage ??  `${subject} copied`,
                                    status: "info",
                                    position: "bottom-right",
                                })
                            }
                        >
                            
                            <Button variant={"ghost"} w="60px">
                                <Tooltip label={subject ? `Copy ${subject}` : "Copy"}>
                                    <Copy></Copy>
                                </Tooltip>
                            </Button>
                            
                        </CopyToClipboard>}
                    </HStack>
                    )
            )}
        </VStack>
    )
}
