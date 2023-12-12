"use client"
import { Box, Button, Flex, HStack, Menu, MenuButton, MenuDivider, MenuGroup, MenuItem, MenuList, Modal, ModalBody, ModalContent, ModalFooter, ModalOverlay, VStack } from "@chakra-ui/react"
import React, { ChangeEvent, ChangeEventHandler, useCallback, useEffect, useRef, useState } from "react"
import { AlignJustify, CheckCircle, Circle, Crop, PlusCircle, Repeat, RotateCcw, Sliders, Trash } from "react-feather"
import shortUUID from "short-uuid"
import { z } from "zod"

import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Block, BlockEditor } from "@/components/FieldEditors/Block/BlockEditor"



import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import "./page.css"
import { ImageEditor } from "@/components/ImageEditor/ImageEditor"
import { apiClient } from "@/networking/ApiClient"
import { UploadButton } from "@/components/UploadButton"
import { useRouter } from "next/navigation"

export default function Home({ params }: { params: { spaceid: string } }) {

    const router = useRouter()
    return <Flex bg="white" p={20} justifyContent={"center"}>


        <UploadButton spaceId={params.spaceid} onUploaded={(asset) => {
            router.push(`/portal/spaces/${params.spaceid}/asset/${asset.assetId}`)
        }}></UploadButton>
        {/* <ImageEditor></ImageEditor> */}
    </Flex>

}


