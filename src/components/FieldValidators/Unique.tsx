"use client"
import React, { useEffect, useState } from "react"
import { TypeOf, z } from "zod"
import { SimpleCheckboxInput } from "../SimpleCheckbox"
import { UniqueValidatorProperties } from "./UniqueSchemas"
import { usePhrases } from "@/lib/lang"

export function UniqueEditor({ settings, onUpdate }: { settings: UniqueValidatorProperties, onUpdate: (settings: UniqueValidatorProperties) => void }) {
    const [enabled, setEnabled] = useState<boolean>(settings.enabled)
    const { t } = usePhrases();
    useEffect(() => {
        setEnabled(settings.enabled)
    }, [settings])

    function onFieldUpdated(enabled: boolean) {
        const settings: UniqueValidatorProperties = { enabled }
        onUpdate(settings)
    }

    return <SimpleCheckboxInput
        subject={t("field_validators_unique_subject")}
        checked={enabled}
        onChange={onFieldUpdated}
        description={t("field_validators_unique_description")}

    ></SimpleCheckboxInput>
}
