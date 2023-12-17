"use client"
import { SpaceItem } from "@/app/api/space/get"
import { GetExternalLink } from "@/lib/link"
import { SpaceLink } from "@/models/space"
import { useSpaces } from "@/networking/hooks/spaces"
import { useAppStore } from "@/stores/appStore"
import {
    Box
} from "@chakra-ui/react"
import { useEffect, useState } from "react"

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
