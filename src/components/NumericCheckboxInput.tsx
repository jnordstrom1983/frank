import { useEffect, useState } from "react"
import { CheckboxInput } from "./CheckboxInput"
import { Box } from "@chakra-ui/react"
import TextInput from "./TextInput"
import { string, z } from "zod"

export function NumericCheckboxInput({
    checked,
    value,
    subject,
    description,
    placeholder,
    onChange,
    onValidation,
}: {
    checked: boolean
    placeholder?: string
    onValidation: (value: boolean) => void
    value: number
    subject?: string
    description?: string
    onChange?: (checked: boolean, value: number) => void
}) {
    const [internalChecked, setInternalChecked] = useState<boolean>(checked)
    const [internalValue, setInternalValue] = useState<number>(value)

    useEffect(() => {
        setInternalChecked(checked)
    }, [checked])

    useEffect(() => {
        setInternalValue(value)
    }, [value])

    return (
        <CheckboxInput
            subject={subject}
            checked={internalChecked}
            onChange={(checked) => {
                setInternalChecked(checked)
                onChange && onChange(checked, value)
            }}
            uncheckedBody={
                <Box
                    fontSize="14px"
                    color={"gray.500"}
                    onClick={() => {
                        setInternalChecked(!internalChecked)
                    }}
                >
                    {description}
                </Box>
            }
            checkedBody={
                <TextInput
                    type="text"
                    placeholder={placeholder}
                    value={internalValue.toString()}
                    onChange={(value) => {
                        if(value === "") value = "0";
                        setInternalValue(parseInt(value))
                        onChange && onChange(checked, parseInt(value))
                    }
                    }
                    validate={z.string().regex(/^\d+$/)}
                    onValidation={onValidation}
                ></TextInput>
            }
        ></CheckboxInput>
    )
}
