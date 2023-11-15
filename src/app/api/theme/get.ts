
import { themeColors } from "@/app/(portal)/themeColors"
import { returnJSON } from "@/lib/apiUtils"
import { z } from "zod"


export const GetThemeResponseSchema = z.object({
    verticalLogo: z.string(),
    horizontalLogo: z.string(),
    blue_50: z.string(),
    blue_100: z.string(),
    blue_200: z.string(),
    blue_300: z.string(),
    blue_400: z.string(),
    blue_500: z.string(),
    blue_600: z.string(),
    blue_700: z.string(),
    blue_800: z.string(),
    blue_900: z.string(),
    green_50: z.string(),
    green_100: z.string(),
    green_200: z.string(),
    green_300: z.string(),
    green_400: z.string(),
    green_500: z.string(),
    green_600: z.string(),
    green_700: z.string(),
    green_800: z.string(),
    green_900: z.string(),
    red_50: z.string(),
    red_100: z.string(),
    red_200: z.string(),
    red_300: z.string(),
    red_400: z.string(),
    red_500: z.string(),
    red_600: z.string(),
    red_700: z.string(),
    red_800: z.string(),
    red_900: z.string(),



})


export type GetThemeResponse = z.infer<typeof GetThemeResponseSchema>

export async function GET(req: Request) {
    const theme: GetThemeResponse = {
        verticalLogo: process.env.THEME_VERTICAL_LOGO || "/static/logo_vertical.svg",
        horizontalLogo: process.env.THEME_HORIZONTAL_LOGO || "/static/logo_horizontal.svg",
        blue_50: process.env.THEME_BLUE_50 || themeColors.blue_50,
        blue_100: process.env.THEME_BLUE_100 || themeColors.blue_100,
        blue_200: process.env.THEME_BLUE_200 || themeColors.blue_200,
        blue_300: process.env.THEME_BLUE_300 || themeColors.blue_300,
        blue_400: process.env.THEME_BLUE_400 || themeColors.blue_400,
        blue_500: process.env.THEME_BLUE_500 || themeColors.blue_500,
        blue_600: process.env.THEME_BLUE_500 || themeColors.blue_600,
        blue_700: process.env.THEME_BLUE_600 || themeColors.blue_700,
        blue_800: process.env.THEME_BLUE_700 || themeColors.blue_800,
        blue_900: process.env.THEME_BLUE_900 || themeColors.blue_900,
        green_50: process.env.THEME_GREEN_50 || themeColors.green_50,
        green_100: process.env.THEME_GREEN_100 || themeColors.green_100,
        green_200: process.env.THEME_GREEN_200 || themeColors.green_200,
        green_300: process.env.THEME_GREEN_300 || themeColors.green_300,
        green_400: process.env.THEME_GREEN_400 || themeColors.green_400,
        green_500: process.env.THEME_GREEN_500 || themeColors.green_500,
        green_600: process.env.THEME_GREEN_600 || themeColors.green_600,
        green_700: process.env.THEME_GREEN_700 || themeColors.green_700,
        green_800: process.env.THEME_GREEN_800 || themeColors.green_800,
        green_900: process.env.THEME_GREEN_900 || themeColors.green_900,
        red_50: process.env.THEME_RED_50 || themeColors.red_50,
        red_100: process.env.THEME_RED_100 || themeColors.red_100,
        red_200: process.env.THEME_RED_200 || themeColors.red_200,
        red_300: process.env.THEME_RED_300 || themeColors.red_300,
        red_400: process.env.THEME_RED_400 || themeColors.red_400,
        red_500: process.env.THEME_RED_500 || themeColors.red_500,
        red_600: process.env.THEME_RED_600 || themeColors.red_600,
        red_700: process.env.THEME_RED_700 || themeColors.red_700,
        red_800: process.env.THEME_RED_800 || themeColors.red_800,
        red_900: process.env.THEME_RED_900 || themeColors.red_900,

    }
    return returnJSON<GetThemeResponse>({ ...theme }, GetThemeResponseSchema)

}


