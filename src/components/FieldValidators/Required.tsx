"use client"
import React, { useEffect, useState } from "react"
import { TypeOf, z } from "zod"
import { SimpleCheckboxInput } from "../SimpleCheckbox"
import { RequiredValidatorProperties } from "./RequiredUtils"

export function RequiredEditor({ settings, onUpdate }: { settings: RequiredValidatorProperties, onUpdate: (settings: RequiredValidatorProperties) => void }) {
    const [enabled, setEnabled] = useState<boolean>(settings.enabled)

    useEffect(() => {
        setEnabled(settings.enabled)
    }, [settings])

    function onFieldUpdated(enabled: boolean) {
        const settings: RequiredValidatorProperties = { enabled }
        onUpdate(settings)
    }

    return <SimpleCheckboxInput
        subject="Required"
        checked={enabled}
        onChange={onFieldUpdated}
        description="Value is required (do not accept empty values)"

    ></SimpleCheckboxInput>
}
