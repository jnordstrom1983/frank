import { useEffect, useState } from "react";
import { CheckboxInput } from "./CheckboxInput";
import { Box } from "@chakra-ui/react";

export function SimpleCheckboxInput({ checked, subject, description, onChange }: { checked: boolean; subject?: string; description?: string; onChange?: (checked: boolean) => void }) {
    const [internalChecked, setInternalChecked] = useState<boolean>(checked)
    useEffect(() => {
        setInternalChecked(checked)
    }, [checked])

    return (
        <CheckboxInput
            subject={subject}
            checked={internalChecked}
            onChange={(checked) => {
                setInternalChecked(checked)
                onChange && onChange(checked)
            }}
            uncheckedBody={
                <Box fontSize="14px" color={"gray.500"} onClick={() => {
                    setInternalChecked(!internalChecked)
                }}>
                    {description}
                </Box>
            }
        ></CheckboxInput>
    )
}

