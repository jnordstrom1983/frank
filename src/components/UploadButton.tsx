"use client"
import { PostAssetResponse } from "@/app/api/space/[spaceid]/asset/post"
import { ImageEditor } from "@/components/ImageEditor/ImageEditor"
import { Asset } from "@/models/asset"
import { apiClient } from "@/networking/ApiClient"
import { Box, Button, Modal, ModalBody, ModalContent, ModalFooter, ModalOverlay, Tooltip } from "@chakra-ui/react"
import "cropperjs/dist/cropper.css"
import React, { ChangeEvent, useRef, useState } from "react"

export function UploadButton({
    spaceId,
    onUploaded,
    text = "Upload",
    colorScheme = "green",
    assetId,
    width,
    height,
    type,
    positiveImageButtonText = "ADD IMAGE ASSET",
    tooltip,
}: {
    text?: string
    spaceId: string
    colorScheme?: "green" | "blue" | "gray"
    onUploaded: (asset: Asset) => void
    assetId?: string
    width?: number
    height?: number
    type?: "file" | "image"
    positiveImageButtonText?: string
    tooltip?: string
}) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [imageEditorOpen, setImageEditorOpen] = useState<boolean>(false)
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("")
    const [addingLoading, setAddingLoading] = useState<boolean>(false)
    async function handleInputChange(ev: ChangeEvent<HTMLInputElement>) {
        if (ev.target.files && ev.target.files.length > 0) {
            const file = ev.target.files[0]
            let ext = file.name.split(".").pop() || ""
            let fileType: "file" | "image" = "file"
            if (["png", "jpg", "jpeg"].includes(ext.toLocaleLowerCase())) {
                fileType = "image"
            }
            if (fileType === "image") {
                const imageUrl = URL.createObjectURL(file)
                setImagePreviewUrl(imageUrl)
                setImageEditorOpen(true)
            } else {
                setAddingLoading(true)
                const asset = await apiClient.postFile<PostAssetResponse>({
                    path: `/space/${spaceId}/asset`,
                    isAuthRequired: true,
                    body: {},
                    file,
                })

                if (inputRef.current) inputRef.current.value = ""
                setAddingLoading(false)
                onUploaded(asset)
            }
        }
    }

    const [rotation, setRotation] = useState<number>()
    const [mirrorX, setMirrorX] = useState<boolean>(false)
    const [mirrorY, setMirrorY] = useState<boolean>(false)
    const [cropX, setCropX] = useState<number>()
    const [cropY, setCropY] = useState<number>()
    const [cropWidth, setCropWidth] = useState<number>()
    const [cropHeight, setCropHeight] = useState<number>()

    return (
        <>
            <Modal
                isOpen={imageEditorOpen}
                onClose={() => {
                    setImageEditorOpen(false)
                }}
                isCentered={true}
            >
                <ModalOverlay />
                <ModalContent w="800px" minW="880px">
                    <ModalBody p={10}>
                        <Box w="800px" minW="800px">
                            <ImageEditor
                                url={imagePreviewUrl}
                                onDataChanged={({ rotation, mirrorX, mirrorY, cropX, cropY, cropHeight, cropWidth }) => {
                                    setRotation(rotation)
                                    setMirrorX(mirrorX)
                                    setMirrorY(mirrorY)
                                    setCropX(cropX)
                                    setCropY(cropY)
                                    setCropWidth(cropWidth)
                                    setCropHeight(cropHeight)
                                }}
                            ></ImageEditor>
                        </Box>
                    </ModalBody>

                    <ModalFooter pb={10} px={10} gap={10}>
                        <Button
                            colorScheme="blue"
                            isLoading={addingLoading}
                            isDisabled={addingLoading}
                            onClick={async () => {
                                if (inputRef.current && inputRef.current.files && inputRef.current.files.length > 0) {
                                    const file = inputRef.current.files[0]

                                    setAddingLoading(true)

                                    const path = assetId ? `/space/${spaceId}/asset/${assetId}/replace` : `/space/${spaceId}/asset`
                                    let body: any = {
                                        rotation,
                                        mirrorX,
                                        mirrorY,
                                        cropX,
                                        cropY,
                                        cropWidth,
                                        cropHeight,
                                    }
                                    if (width) {
                                        body = { ...body, width }
                                    }
                                    if (height) {
                                        body = { ...body, height }
                                    }

                                    const asset = await apiClient.postFile<Asset>({
                                        path,
                                        isAuthRequired: true,
                                        body,
                                        file,
                                    })
                                    if (inputRef.current) inputRef.current.value = ""
                                    setAddingLoading(false)
                                    setImageEditorOpen(false)
                                    onUploaded(asset)
                                }
                            }}
                        >
                            {positiveImageButtonText}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setImageEditorOpen(false)
                                if (inputRef.current) inputRef.current.value = ""
                            }}
                        >
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {tooltip ? (
                <Tooltip label={tooltip}>
                    <Button
                        colorScheme={colorScheme}
                        width="150px"
                        isLoading={addingLoading}
                        isDisabled={addingLoading}
                        onClick={() => {
                            inputRef.current?.click()
                        }}
                    >
                        {text}
                    </Button>
                </Tooltip>
            ) : (
                <Button
                    colorScheme={colorScheme}
                    width="150px"
                    isLoading={addingLoading}
                    isDisabled={addingLoading}
                    onClick={() => {
                        inputRef.current?.click()
                    }}
                >
                    {text}
                </Button>
            )}

            <input
                type="file"
                onChange={handleInputChange}
                accept={type === "image" ? "image/png, image/gif, image/jpeg" : undefined}
                ref={inputRef}
                style={{ display: "none" }}
            ></input>
        </>
    )
}
