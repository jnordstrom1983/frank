
"use client"
import { Empty } from "@/components/Empty"
import React from "react"

export function FieldEditorNotImplementedYet({ name, dataTypeId, dataTypeVariantId }: { name: String; dataTypeId: string; dataTypeVariantId: string }) {
    return <Empty message={`Field ${name} is not yet implemented (${dataTypeId}.${dataTypeVariantId}})`}></Empty>
}

