import { useEffect, useState } from "react"
import { TypeOf, z } from "zod"
import { MaxValueValidatorProperties } from "./MaxValueUtils"
import { NumericCheckboxInput } from "../NumericCheckboxInput"
import { usePhrases } from "@/lib/lang"

export function MaxValueEditor({ settings, onUpdate, onValidation }: { settings: MaxValueValidatorProperties, onUpdate: (settings: MaxValueValidatorProperties) => void , onValidation : (valid : boolean) => void }) {
    const [enabled, setEnabled] = useState<boolean>(settings.enabled)
    const [value, setValue] = useState<number>(settings.max)
    const { t }  = usePhrases();

    useEffect(() => {
        setEnabled(settings.enabled)
        setValue(settings.max)
    }, [settings])

    function onFieldUpdated(enabled: boolean, max : number) {
        const settings: MaxValueValidatorProperties = { enabled, max }
        onUpdate(settings)
    }

    return <NumericCheckboxInput
        subject={t("field_validators_maxvalue_subject")}
        checked={enabled}
        value={value}
        onChange={(checked, value) => {
            setEnabled(checked)
            setValue(value)
            onFieldUpdated(checked, value)
        } }
        description={t("field_validators_maxvalue_description")}
        onValidation={onValidation}
    ></NumericCheckboxInput>
}
