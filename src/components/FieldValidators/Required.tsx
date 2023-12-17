"use client"
import React, { useEffect, useState } from "react"
import { TypeOf, z } from "zod"
import { SimpleCheckboxInput } from "../SimpleCheckbox"
import { RequiredValidatorProperties } from "./RequiredUtils"
import { usePhrases } from "@/lib/lang"

export function RequiredEditor({ settings, onUpdate }: { settings: RequiredValidatorProperties, onUpdate: (settings: RequiredValidatorProperties) => void }) {
    const [enabled, setEnabled] = useState<boolean>(settings.enabled)
    const { t } = usePhrases();

    useEffect(() => {
        setEnabled(settings.enabled)
    }, [settings])

    function onFieldUpdated(enabled: boolean) {
        const settings: RequiredValidatorProperties = { enabled }
        onUpdate(settings)
    }

    return <SimpleCheckboxInput
        subject={t("field_validators_required_subject")}
        checked={enabled}
        onChange={onFieldUpdated}
        description={t("field_validators_required_description")}

    ></SimpleCheckboxInput>
}
