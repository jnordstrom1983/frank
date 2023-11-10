"use client"
import { CheckboxInput } from "@/components/CheckboxInput"
import { SaveMenuBar } from "@/components/SaveMenuBar"
import { SelectionList } from "@/components/SelectionList"
import { SpaceLanguage, SpaceLink } from "@/models/space"
import { useContentItem } from "@/networking/hooks/content"
import { useContenttype } from "@/networking/hooks/contenttypes"
import { useSpaces } from "@/networking/hooks/spaces"
import { useAppStore } from "@/stores/appStore"
import {
    Box,
    Button,
    Center,
    Container,
    HStack,
    Spinner,
    Th,
    Thead,
    Tooltip,
    Tr,
    Table,
    VStack,
    Tbody,
    Td,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Text,
    useToast,
    Tag,
    Progress,
} from "@chakra-ui/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AlertTriangle, Check, Copy, Edit2, Flag, Sliders, Trash2 } from "react-feather"
import { languages as allLanguages } from "@/lib/constants"
import { EditorLanguages } from "@/components/ContentEditor/Editor"
import { Empty } from "@/components/Empty"
import TextInput from "@/components/TextInput"
import { z } from "zod"
import { camelize } from "@/lib/utils"
import { PutContentTypeItemRequest, PutContentTypeItemResponse } from "@/app/api/space/[spaceid]/contenttype/[contenttypeid]/put"
import { apiClient } from "@/networking/ApiClient"
import { PutContentItemRequest, PutContentItemResponse } from "@/app/api/space/[spaceid]/content/[contentid]/put"
import { useQueryClient } from "@tanstack/react-query"
import { PostAIRequest, PostAIResponse } from "@/app/api/space/[spaceid]/ai/post"
import { GetAITaskItemResponse } from "@/app/api/space/[spaceid]/ai/task/[taskid]/get"
import CopyToClipboard from "react-copy-to-clipboard"
import { progress } from "framer-motion"
import { SpaceItem } from "@/app/api/space/get"
import { GetExternalLink } from "@/lib/link"

interface LanguageData {
    [key: string]: Record<string, any>
}
export default function Home({ params }: { params: { spaceid: string; linkid: string } }) {
    const { showMainMenu, hideMainMenu, setMainMenu } = useAppStore((state) => state)

    useEffect(() => {
        showMainMenu()
        setMainMenu(params.linkid)
    }, [])

    const { spaces } = useSpaces({ enabled: true })

    const [space, setSpace] = useState<SpaceItem>()
    const [link, setLink] = useState<SpaceLink>()
    useEffect(() => {
        if (!spaces) return
        const space = spaces.find((s) => s.spaceId === params.spaceid);
        if(!space) return;

        const link = space.links.find(l=>l.linkId === params.linkid)
        setSpace(space)
        setLink(link)

    }, [spaces])

    if(!link) return <></>

    return <Box>
    <iframe src={GetExternalLink(link.url)} style={{ height : "calc(100vh - 46px)", width : "100%"}}></iframe>
    </Box>

}
