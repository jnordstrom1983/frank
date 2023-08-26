"use client"
import { useEffect, useState } from "react"
import { TypeOf, z } from "zod"
import { NumericCheckboxInput } from "../NumericCheckboxInput"
import { MaxLengthValidatorProperties } from "./MaxLengthUtils"

export function MaxLengthEditor({ settings, onUpdate, onValidation }: { settings: MaxLengthValidatorProperties, onUpdate: (settings: MaxLengthValidatorProperties) => void , onValidation : (valid : boolean) => void }) {
    const [enabled, setEnabled] = useState<boolean>(settings.enabled)
    const [value, setValue] = useState<number>(settings.max)

    useEffect(() => {
        setEnabled(settings.enabled)
        setValue(settings.max)
    }, [settings])

    function onFieldUpdated(enabled: boolean, max : number) {
        const settings: MaxLengthValidatorProperties = { enabled, max }
        onUpdate(settings)
    }

    return <NumericCheckboxInput
        subject="Max length"
        checked={enabled}
        value={value}
        onChange={(checked, value) => {
            setEnabled(checked)
            setValue(value)
            onFieldUpdated(checked, value)
        } }
        description="Value can not be longer than this"
        onValidation={onValidation}
    ></NumericCheckboxInput>
}
