import { useEffect, useState } from "react"
import { TypeOf, z } from "zod"
import { MaxValueValidatorProperties } from "./MaxValueUtils"
import { NumericCheckboxInput } from "../NumericCheckboxInput"

export function MaxValueEditor({ settings, onUpdate, onValidation }: { settings: MaxValueValidatorProperties, onUpdate: (settings: MaxValueValidatorProperties) => void , onValidation : (valid : boolean) => void }) {
    const [enabled, setEnabled] = useState<boolean>(settings.enabled)
    const [value, setValue] = useState<number>(settings.max)

    useEffect(() => {
        setEnabled(settings.enabled)
        setValue(settings.max)
    }, [settings])

    function onFieldUpdated(enabled: boolean, max : number) {
        const settings: MaxValueValidatorProperties = { enabled, max }
        onUpdate(settings)
    }

    return <NumericCheckboxInput
        subject="Max value"
        checked={enabled}
        value={value}
        onChange={(checked, value) => {
            setEnabled(checked)
            setValue(value)
            onFieldUpdated(checked, value)
        } }
        description="Value cannot be bigger than this"
        onValidation={onValidation}
    ></NumericCheckboxInput>
}
