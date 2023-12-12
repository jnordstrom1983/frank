"use client"
import { Poppins } from "next/font/google"

import { useTheme } from "@/networking/hooks/theme"
import { CacheProvider } from "@chakra-ui/next-js"
import { ChakraProvider } from "@chakra-ui/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { ThemeContext, getTheme } from "./theme"
import { GetClientLanguage } from "@/lib/lang"
import { useAppStore } from "@/stores/appStore"



const popins = Poppins({ subsets: ["latin"], weight: ["100", "200", "300", "400", "500", "600"] })

export function Providers({ children }: { children: React.ReactNode }) {

    const setUiLanguage = useAppStore(state=>state.setUiLanguage)

    useEffect(()=>{
        const lang = GetClientLanguage()
        setUiLanguage(lang);
    }, [])

    
    const [client] = useState(
        new QueryClient({ defaultOptions: { queries: {  refetchOnWindowFocus : false, staleTime : 1000000 } } })
      );
    

      
    return (
  
        <>
            <style jsx global>
                {`
                    :root {
                        --font-poppins: ${popins.style.fontFamily};
                    }
                    body {
                        font-family: ${popins.style.fontFamily};
                        background-color: #f7f8fa;
                    }
                `}
            </style>
            
                <QueryClientProvider client={client}>
                    <CacheProvider>
                        <ThemeProvider>{children}</ThemeProvider>
                    </CacheProvider>
                </QueryClientProvider>
           
        </> 
    )
}


function ThemeProvider({ children }: { children: React.ReactNode }){
    const { theme } = useTheme()
    const [chakraTheme, setChakraTheme]  = useState<Record<string, any>>({});
    useEffect(()=>{
      if(!theme) return;
      setChakraTheme(getTheme(theme))
      
    }, [theme])

    return theme ? <ThemeContext.Provider value={theme}>
           <ChakraProvider theme={chakraTheme}>{children}</ChakraProvider>

        
        
        </ThemeContext.Provider> : <></>

}
