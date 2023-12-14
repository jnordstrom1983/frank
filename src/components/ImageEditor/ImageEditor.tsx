"use client"
import { Box, Button, Flex, HStack, VStack } from "@chakra-ui/react"
import "cropperjs/dist/cropper.css"
import React, { useEffect, useRef, useState } from "react"
import Cropper, { ReactCropperElement } from "react-cropper"
import { CropIcon } from "./Icons/CropIcon"
import { MirrorIcon } from "./Icons/MirrorIcon"
import { MirrorXIcon } from "./Icons/MirrorXIcon"
import { MirrorYIcon } from "./Icons/MirrorYIcon"
import { RotateIcon } from "./Icons/RotateIcon"
import "./ImageEditor.css"
import { RotateWheel } from "./RotateWheel"
import { usePhrases } from "@/lib/lang"

export function ImageEditor({ url, onDataChanged }: {
    url: string, onDataChanged: (data: {
        rotation: number,
        mirrorX: boolean,
        mirrorY: boolean,
        cropX: number,
        cropY: number,
        cropWidth: number,
        cropHeight: number
    }) => void
}) {

    const cropperRef = useRef<ReactCropperElement>(null);
    const onCrop = () => {
        const cropper = cropperRef.current?.cropper;
        if (cropper) {
            const data = cropper.getData()
            setCropX(data.x);
            setCropY(data.y);
            setCropWidth(data.width);
            setCropHeight(data.height);

        }
    };

    const [tool, setTool] = useState<"crop" | "rotate" | "mirror">("crop");

    const [rotation, setRotation] = useState<number>(0)
    const [proportion, setPropportion] = useState<string>("free")

    const [mirrorX, setMirrorX] = useState<boolean>(false);
    const [mirrorY, setMirrorY] = useState<boolean>(false);

    const [cropX, setCropX] = useState<number>(0);
    const [cropY, setCropY] = useState<number>(0);
    const [cropWidth, setCropWidth] = useState<number>(0);
    const [cropHeight, setCropHeight] = useState<number>(0);
    const { t } = usePhrases();

    useEffect(() => {
        onDataChanged({ rotation, mirrorX, mirrorY, cropX, cropY, cropWidth, cropHeight })
    }, [rotation, mirrorX, mirrorY, cropX, cropY, cropWidth, cropHeight])

    return (
        url ? <HStack>
            <VStack w="80px" justifyContent={"center"}>
                <Box h="70px"></Box>
                <VStack spacing={5}>
                    <Button variant={"ghost"} height={"70px"} borderRadius="50%" width={"70px"} bg={tool === "crop" ? "gray.200" : undefined} onClick={() => setTool("crop")}>
                        <CropIcon></CropIcon>
                    </Button>
                    <Button variant={"ghost"} height={"70px"} borderRadius="50%" width={"70px"} bg={tool === "rotate" ? "gray.200" : undefined} onClick={() => setTool("rotate")}>
                        <RotateIcon></RotateIcon>
                    </Button>
                    <Button variant={"ghost"} height={"70px"} borderRadius="50%" width={"70px"} bg={tool === "mirror" ? "gray.200" : undefined} onClick={() => setTool("mirror")}>
                        <MirrorIcon></MirrorIcon>
                    </Button>
                </VStack>
            </VStack>
            <VStack w="711px">
                <Box h="70px">



                    {tool === "rotate" && <RotateWheel rotation={rotation} onRotate={(rotation) => {
                        const cropper = cropperRef.current?.cropper;
                        if (cropper) {
                            cropper.rotateTo(rotation);
                            setRotation(rotation);
                        }
                    }}></RotateWheel>}

                    {tool === "mirror" && <Flex h="100%" w="100%" alignItems={"center"} justifyContent={"center"}>
                        <HStack>


                            <Button variant={"ghost"} height={"70px"} width={"70px"} onClick={() => {
                                const cropper = cropperRef.current?.cropper;
                                if (cropper) {

                                    cropper.scaleX(mirrorX ? 1 : -1);
                                    setMirrorX(!mirrorX)
                                }
                            }}>
                                <MirrorXIcon></MirrorXIcon>
                            </Button>
                            <Button variant={"ghost"} height={"70px"} width={"70px"} onClick={() => {
                                const cropper = cropperRef.current?.cropper;
                                if (cropper) {
                                    cropper.scaleY(mirrorY ? 1 : -1);
                                    setMirrorY(!mirrorY)
                                }


                            }}>
                                <MirrorYIcon></MirrorYIcon>
                            </Button>


                        </HStack>
                    </Flex>}

                    {tool === "crop" && <Flex h="100%" w="100%" alignItems={"center"} justifyContent={"center"}>

                        <Box bgColor="#F0F0F0" borderRadius="30px" paddingX={10} paddingY={3}>
                            <HStack>
                                <Box>{t("image_editor_aspect_ratio")}</Box>
                                {[{ key: "free", text: t("image_editor_aspect_ratio_free") }, { key: "square", text: t("image_editor_aspect_ratio_square") }, { key: "16_9", text: "16:9" }, { key: "4_3", text: "4:3" }].map(item => {
                                    return (
                                        proportion === item.key ? <Button key={item.key} variant={"ghost"} fontSize="13px" height={"auto"} backgroundColor={"blue.500"} color="#fff" borderRadius={10} padding={2} _hover={{ backgroundColor: "blue.300" }}>{item.text}</Button> : <Button key={item.key} variant={"ghost"} fontSize="13px" height={"auto"} borderRadius={10} padding={2} _hover={{ backgroundColor: "blue.300", color: "#fff" }} onClick={() => {
                                            setPropportion(item.key)
                                            const cropper = cropperRef.current?.cropper;
                                            if (cropper) {
                                                switch (item.key) {
                                                    case "free":
                                                        cropper.setAspectRatio(NaN);
                                                        break;
                                                    case "square":
                                                        cropper.setAspectRatio(1);
                                                        break;
                                                    case "16_9":
                                                        cropper.setAspectRatio(16 / 9);
                                                        break;
                                                    case "4_3":
                                                        cropper.setAspectRatio(4 / 3);
                                                        break;

                                                }


                                            }
                                        }}>{item.text}</Button>
                                    )

                                })}
                            </HStack>
                        </Box>
                    </Flex>
                    }
                </Box>
                <Box justifyContent={"center"}>
                    <Cropper
                        src={url}
                        style={{ height: 400, width: 711 }}
                        // Cropper.js options
                        autoCropArea={1}
                        initialAspectRatio={undefined}
                        guides={true}
                        crop={onCrop}
                        ref={cropperRef}
                        zoomable={false}
                        viewMode={1}

                    />

                </Box>
            </VStack>
        </HStack> : <></>



    )
}

