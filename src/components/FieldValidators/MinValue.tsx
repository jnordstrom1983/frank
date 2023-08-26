import { TypeOf, z } from "zod"
import { MinValueValidatorProperties } from "./MinValueUtils"
import { useEffect, useState } from "react"
import { NumericCheckboxInput } from "../NumericCheckboxInput"

export function MinValueEditor({ settings, onUpdate, onValidation }: { settings: MinValueValidatorProperties, onUpdate: (settings: MinValueValidatorProperties) => void , onValidation : (valid : boolean) => void }) {
    const [enabled, setEnabled] = useState<boolean>(settings.enabled)
    const [value, setValue] = useState<number>(settings.min)

    useEffect(() => {
        setEnabled(settings.enabled)
        setValue(settings.min)
    }, [settings])

    function onFieldUpdated(enabled: boolean, min : number) {
        const settings: MinValueValidatorProperties = { enabled, min }
        onUpdate(settings)
    }

    return <NumericCheckboxInput
        subject="Min value"
        checked={enabled}
        value={value}
        onChange={(checked, value) => {
            setEnabled(checked)
            setValue(value)
            onFieldUpdated(checked, value)
        } }
        description="Value cannot be less than this"
        onValidation={onValidation}
    ></NumericCheckboxInput>
}
