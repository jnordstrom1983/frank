"use client"
import { useAppStore } from "@/stores/appStore"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Layout({ children, params }: { children: React.ReactNode; params: { spaceid: string; setting: string } }) {
    const router = useRouter()
    const { setMainMenu, mainMenu, settingsMenu } = useAppStore((state) => state)
    useEffect(() => {
        if (mainMenu !== "settings") setMainMenu("settings")
    }, [mainMenu])
    return <>{children}</>
}
