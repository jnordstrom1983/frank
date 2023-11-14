import { returnJSON } from "@/lib/apiUtils"
import { z } from "zod"

export const GetThemeResponseSchema = z.object({
    verticalLogo : z.string(),
    horizontalLogo : z.string()
})


export type GetThemeResponse = z.infer<typeof GetThemeResponseSchema>

export async function GET(req: Request) {
    const theme : GetThemeResponse = {
        verticalLogo : process.env.THEME_VERTICAL_LOGO || "/static/logo_vertical.svg",
        horizontalLogo : process.env.THEME_HORIZONTAL_LOGO || "/static/logo_horizontal.svg"
    }
    return returnJSON<GetThemeResponse>({ ...theme }, GetThemeResponseSchema)

}

