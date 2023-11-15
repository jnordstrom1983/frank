import { returnJSON } from "@/lib/apiUtils"
import { z } from "zod"
export const dynamic = 'force-dynamic'

export const GetThemeResponseSchema = z.object({
    verticalLogo : z.string(),
    horizontalLogo : z.string(),
    blue_50 : z.string(),
    blue_100 : z.string(),
    blue_200 : z.string(),
    blue_300 : z.string(),
    blue_400 : z.string(),
    blue_500 : z.string(),
    blue_600 : z.string(),
    blue_700 : z.string(),
    blue_800 : z.string(),
    blue_900 : z.string(),
    green_50 : z.string(),
    green_100 : z.string(),
    green_200 : z.string(),
    green_300 : z.string(),
    green_400 : z.string(),
    green_500 : z.string(),
    green_600 : z.string(),
    green_700 : z.string(),
    green_800 : z.string(),
    green_900 : z.string(),
    red_50 : z.string(),
    red_100 : z.string(),
    red_200 : z.string(),
    red_300 : z.string(),
    red_400 : z.string(),
    red_500 : z.string(),
    red_600 : z.string(),
    red_700 : z.string(),
    red_800 : z.string(),
    red_900 : z.string(),    
    


})


export type GetThemeResponse = z.infer<typeof GetThemeResponseSchema>

export async function GET(req: Request) {
    const theme : GetThemeResponse = {
        verticalLogo : process.env.THEME_VERTICAL_LOGO || "/static/logo_vertical.svg",
        horizontalLogo : process.env.THEME_HORIZONTAL_LOGO || "/static/logo_horizontal.svg",
        blue_50 : process.env.THEME_BLUE_50 || "#F0F2F5",
        blue_100 : process.env.THEME_BLUE_100 || "#D5DCE2",
        blue_200 : process.env.THEME_BLUE_200 || "#BAC5CF",
        blue_300 : process.env.THEME_BLUE_300 || "#9FAFBC",
        blue_400 : process.env.THEME_BLUE_400 || "#8498A9",
        blue_500 : process.env.THEME_BLUE_500 || "#698296",
        blue_600 : process.env.THEME_BLUE_500 || "#546878",
        blue_700 : process.env.THEME_BLUE_600 || "#3F4E5A",
        blue_800 : process.env.THEME_BLUE_700 || "#2A343C",
        blue_900 : process.env.THEME_BLUE_900 || "#151A1E",
        green_50 : process.env.THEME_GREEN_50 ||"#F0F5F3",
        green_100: process.env.THEME_GREEN_100 ||"#D5E2DC",
        green_200: process.env.THEME_GREEN_200 ||"#BACFC6",
        green_300:process.env.THEME_GREEN_300 || "#9EBCAF",
        green_400: process.env.THEME_GREEN_400 ||"#83AA99",
        green_500:process.env.THEME_GREEN_500 || "#689783",
        green_600:process.env.THEME_GREEN_600 ||"#537968",
        green_700: process.env.THEME_GREEN_700 ||"#3E5B4E",
        green_800:process.env.THEME_GREEN_800 || "#2A3C34",
        green_900:process.env.THEME_GREEN_900 || "#151E1A",     
        red_50: process.env.THEME_RED_50 || "#F4F0F0",
        red_100: process.env.THEME_RED_100 ||"#E1D5D6",
        red_200: process.env.THEME_RED_200 ||"#CEBBBC",
        red_300: process.env.THEME_RED_300 ||"#BBA0A2",
        red_400:process.env.THEME_RED_400 || "#A88587",
        red_500: process.env.THEME_RED_500 ||"#946B6D",
        red_600:process.env.THEME_RED_600 || "#775557",
        red_700: process.env.THEME_RED_700 ||"#594041",
        red_800: process.env.THEME_RED_800 ||"#3B2B2C",
        red_900: process.env.THEME_RED_900 ||"#1E1516",

    }
    return returnJSON<GetThemeResponse>({ ...theme }, GetThemeResponseSchema)

}


