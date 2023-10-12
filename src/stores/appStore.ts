import { create } from 'zustand'

interface AppStoreState {
    mainMenu: "content" | "contentType" | "settings" | "asset" | "translation",
    isMainMenuVisible: boolean,
    settingsMenu: "main" | "users" | "keys" | "api" | "webhooks",
    setMainMenu: (menu: "content" | "contentType" | "settings" | "asset" | "translation") => void,
    setSettingsMenu: (menu: "main" | "users" | "api" | "keys" | "webhooks") => void,
    showMainMenu: () => void
    hideMainMenu: () => void
    isSignoutVisible: boolean;
    setSignoutVisible: (visible: boolean) => void;
}

export const useAppStore = create<AppStoreState>((set, get) => ({
    mainMenu: "content",
    settingsMenu: "main",
    isMainMenuVisible: true,
    isSignoutVisible: false,
    setMainMenu(menu) {
        set({ mainMenu: menu })
    },
    showMainMenu() {
        set({ isMainMenuVisible: true })
    },
    hideMainMenu() {
        set({ isMainMenuVisible: false })
    },
    setSettingsMenu(menu) {
        set({ settingsMenu: menu })
    },
    setSignoutVisible(visible) {
        set({ isSignoutVisible: visible })

    }
}))
