import { create } from 'zustand'

interface AppStoreState {
    mainMenu: string,
    isMainMenuVisible: boolean,
    settingsMenu: "main" | "users" | "keys" | "api" | "webhooks" | "links",
    setMainMenu: (menu: string) => void,
    setSettingsMenu: (menu: "main" | "users" | "api" | "keys" | "webhooks" | "links") => void,
    showMainMenu: () => void
    hideMainMenu: () => void
    isSignoutVisible: boolean;
    setSignoutVisible: (visible: boolean) => void;
    uiLanguage : string;
    setUiLanguage : (language : string) => void
}

export const useAppStore = create<AppStoreState>((set, get) => ({
    mainMenu: "content",
    settingsMenu: "main",
    isMainMenuVisible: true,
    isSignoutVisible: false,
    uiLanguage :  "en",
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
    },
    setUiLanguage(language){
        localStorage.setItem("FRANK_LANGUAGE", language)
        set({uiLanguage : language})
    }
}))
