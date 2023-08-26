"use client"
import { useAppStore } from "@/stores/appStore";
import { useEffect } from "react";

export default function Layout({ children, params }: { children: React.ReactNode, params: { spaceid: string } }) {
    const { setMainMenu, mainMenu } = useAppStore(state => state)
    useEffect(() => {
        if (mainMenu !== "content") setMainMenu("content");
    }, [mainMenu])
    return <>{children}</>
}
