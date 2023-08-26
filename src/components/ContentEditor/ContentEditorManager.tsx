"use client"
import { ContentData } from "@/models/contentdata"
import { ContentType } from "@/models/contentype"
import { SpaceLanguage } from "@/models/space"
import React, { useEffect, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { ContentEditor } from "./ContentEditor"


export function ContentEditorManager({
    contentDatas,
    contentType,
    language,
    onDataChange,
    onValidation,
    showValidation,
    spaceId,
}: {
    contentDatas: ContentData[]
    contentType: ContentType
    language: SpaceLanguage
    onDataChange: (data: Record<string, any>) => void
    onValidation?: (fieldId: string, valid: boolean) => void
    showValidation: boolean,
    spaceId: string
}) {
    const [internalDatas, setInternalDatas] = useState<ContentData[]>([])
    const [currentData, setCurrentData] = useState<Record<string, any>>({})
    const [dataIsSet, setDataIsSet] = useState<boolean>(false);
    useEffect(() => {
        const data = contentDatas.find((c) => c.languageId === language)?.data || {}
        setCurrentData({ ...data })
        setDataIsSet(true);
    }, [language])
    useEffect(() => {
        setInternalDatas(contentDatas)
        const data = contentDatas.find((c) => c.languageId === language)?.data || {}
        setCurrentData({ ...data })
        setDataIsSet(true);

    }, [contentDatas])

    return (
        dataIsSet &&
        <ContentEditor
            data={currentData}
            spaceId={spaceId}
            fields={contentType.fields}
            showValidation={showValidation}
            onDataChange={(fieldId, data) => {

                setInternalDatas((internalDatas) => {
                    let dataItemIndex = internalDatas.findIndex((p) => p.languageId === language)
                    if (dataItemIndex > -1) {
                        internalDatas[dataItemIndex].data[fieldId] = data
                    } else {
                        let dataValue: Record<string, any> = {}
                        dataValue[fieldId] = data;
                        const dataItem = {
                            contentDataId: uuidv4(),
                            contentTypeId: contentType.contentTypeId,
                            spaceId: "",
                            contentId: "",
                            languageId: language,
                            modifiedUserId: "",
                            modifiedDate: new Date(),
                            data: dataValue
                        }
                        //@ts-ignore
                        internalDatas.push(dataItem)
                    }

                    dataItemIndex = internalDatas.findIndex((p) => p.languageId === language)
                    onDataChange(internalDatas[dataItemIndex].data)
                    return internalDatas
                })

            }}
            onValidation={(fieldId, valid) => onValidation && onValidation(fieldId, valid)}
        ></ContentEditor>
    )
}