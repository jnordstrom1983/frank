"use client"
import { useEffect, useState } from "react"
import { TypeOf, z } from "zod"
import { NumericCheckboxInput } from "../NumericCheckboxInput"
import { MinLengthValidatorProperties } from "./MinLengthUtils"
import { usePhrases } from "@/lib/lang"

export function MinLengthEditor({ settings, onUpdate, onValidation }: { settings: MinLengthValidatorProperties, onUpdate: (settings: MinLengthValidatorProperties) => void , onValidation : (valid : boolean) => void }) {
    const [enabled, setEnabled] = useState<boolean>(settings.enabled)
    const [value, setValue] = useState<number>(settings.min)
    const { t } = usePhrases();

    useEffect(() => {
        setEnabled(settings.enabled)
        setValue(settings.min)
    }, [settings])

    function onFieldUpdated(enabled: boolean, min : number) {
        const settings: MinLengthValidatorProperties = { enabled, min }
        onUpdate(settings)
    }

    return <NumericCheckboxInput
        subject={t("field_validators_minlength_subject")}
        checked={enabled}
        value={value}
        onChange={(checked, value) => {
            setEnabled(checked)
            setValue(value)
            onFieldUpdated(checked, value)
        } }
        description={t("field_validators_minlength_description")}
        onValidation={onValidation}
    ></NumericCheckboxInput>
}
