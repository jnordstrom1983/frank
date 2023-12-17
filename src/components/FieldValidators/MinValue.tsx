import { TypeOf, z } from "zod"
import { MinValueValidatorProperties } from "./MinValueUtils"
import { useEffect, useState } from "react"
import { NumericCheckboxInput } from "../NumericCheckboxInput"
import { usePhrases } from "@/lib/lang"

export function MinValueEditor({ settings, onUpdate, onValidation }: { settings: MinValueValidatorProperties, onUpdate: (settings: MinValueValidatorProperties) => void , onValidation : (valid : boolean) => void }) {
    const [enabled, setEnabled] = useState<boolean>(settings.enabled)
    const [value, setValue] = useState<number>(settings.min)
    const { t }  = usePhrases();
    useEffect(() => {
        setEnabled(settings.enabled)
        setValue(settings.min)
    }, [settings])

    function onFieldUpdated(enabled: boolean, min : number) {
        const settings: MinValueValidatorProperties = { enabled, min }
        onUpdate(settings)
    }

    return <NumericCheckboxInput
        subject={t("field_validators_minvalue_subject")}
        checked={enabled}
        value={value}
        onChange={(checked, value) => {
            setEnabled(checked)
            setValue(value)
            onFieldUpdated(checked, value)
        } }
        description={t("field_validators_minvalue_description")}
        onValidation={onValidation}
    ></NumericCheckboxInput>
}
