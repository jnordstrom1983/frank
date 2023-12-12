import { en } from "@/languages/en";
import { languages } from "@/languages/languages";
import { useAppStore } from "@/stores/appStore";


//@ts-ignore
export const languageOptions = Object.keys(languages).map(key => ( { key : key, text : languages[key].name as string }))

export function GetClientLanguage(){
    let lang = localStorage.getItem("FRANK_LANGUAGE");
    if(!lang){
        lang = navigator.language.split("-")[0]
        //@ts-ignore
        if(!languages[lang]){
            lang = "en";
        }
        return lang;
    }
    //@ts-ignore
    if(!languages[lang]){
        lang = "en";
    }
    return lang;    

}


export function usePhrases(){
    const uiLanguage = useAppStore((state) => state.uiLanguage);
    let lang = languages.en;

    //@ts-ignore
    if(languages[uiLanguage]){
        //@ts-ignore
        lang = languages[uiLanguage]
    }
    const phrases = lang.phrases
    const t = (phrase : string, arg1? : string, arg2? : string, arg3? : string) => {
        //@ts-ignore
        if(phrases[phrase]){
            //@ts-ignore
            let value = phrases[phrase]
            if(arg1) value = value.replace("%1", arg1)
            if(arg2) value = value.replace("%2", arg2)
            if(arg3) value = value.replace("%3", arg3)
            return value;
        }else{
            return phrase
        }
    }
 
    return { phrases, t }
}