"use client"
import Editor from "@/components/ContentEditor/Editor"
import { useToast } from "@chakra-ui/react"
import { useRouter } from "next/navigation"
import React from "react"
export default function Home({ params }: { params: { spaceid: string; contentid: string } }) {
    const router = useRouter()
    const toast = useToast();
    return <Editor spaceId={params.spaceid} contentId={params.contentid} layout="row" onBack={() => {
        router.push(`/portal/spaces/${params.spaceid}/content`)
    }} onSaved={() => {

        toast({
            title: "Content saved",
            status: "success",
            position: "bottom-right",
        })

    }}></Editor>
}

