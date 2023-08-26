"use client"
import React, { useEffect, useState } from "react"
import { TypeOf, z } from "zod"
import { SimpleCheckboxInput } from "../SimpleCheckbox"
import { UniqueValidatorProperties } from "./UniqueSchemas"

export function UniqueEditor({ settings, onUpdate }: { settings: UniqueValidatorProperties, onUpdate: (settings: UniqueValidatorProperties) => void }) {
    const [enabled, setEnabled] = useState<boolean>(settings.enabled)

    useEffect(() => {
        setEnabled(settings.enabled)
    }, [settings])

    function onFieldUpdated(enabled: boolean) {
        const settings: UniqueValidatorProperties = { enabled }
        onUpdate(settings)
    }

    return <SimpleCheckboxInput
        subject="Unique"
        checked={enabled}
        onChange={onFieldUpdated}
        description="No other content might have the same value"

    ></SimpleCheckboxInput>
}
