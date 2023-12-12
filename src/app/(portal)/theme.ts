import { extendTheme } from "@chakra-ui/react"
import { createContext } from "react"
import { GetThemeResponse } from "../api/theme/get"
import { themeColors } from "./themeColors"

export const ThemeContext = createContext<GetThemeResponse | null>(null)




function getColors(themeContext?: GetThemeResponse | null) {
    return {
        blue: {
            "50": themeContext?.blue_50 || process?.env?.THEME_BLUE_50 || themeColors.blue_50,
            "100": themeContext?.blue_100 || process?.env?.THEME_BLUE_100 || themeColors.blue_100,
            "200": themeContext?.blue_200 || process?.env?.THEME_BLUE_200 || themeColors.blue_200,
            "300": themeContext?.blue_300 || process?.env?.THEME_BLUE_300 || themeColors.blue_300,
            "400": themeContext?.blue_400 || process?.env?.THEME_BLUE_400 || themeColors.blue_400,
            "500": themeContext?.blue_500 || process?.env?.THEME_BLUE_500 || themeColors.blue_500,
            "600": themeContext?.blue_600 || process?.env?.THEME_BLUE_600 || themeColors.blue_600,
            "700": themeContext?.blue_700 || process?.env?.THEME_BLUE_700 || themeColors.blue_700,
            "800": themeContext?.blue_800 || process?.env?.THEME_BLUE_800 || themeColors.blue_800,
            "900": themeContext?.blue_900 || process?.env?.THEME_BLUE_900 || themeColors.blue_900,
        },
        green: {
            "50": themeContext?.green_50 || process?.env?.THEME_GREEN_50 || themeColors.green_50,
            "100": themeContext?.green_100 || process?.env?.THEME_GREEN_100 || themeColors.green_100,
            "200": themeContext?.green_200 || process?.env?.THEME_GREEN_200 || themeColors.green_200,
            "300": themeContext?.green_300 || process?.env?.THEME_GREEN_300 || themeColors.green_300,
            "400": themeContext?.green_400 || process?.env?.THEME_GREEN_400 || themeColors.green_400,
            "500": themeContext?.green_500 || process?.env?.THEME_GREEN_500 || themeColors.green_500,
            "600": themeContext?.green_600 || process?.env?.THEME_GREEN_600 || themeColors.green_600,
            "700": themeContext?.green_700 || process?.env?.THEME_GREEN_700 || themeColors.green_700,
            "800": themeContext?.green_800 || process?.env?.THEME_GREEN_800 || themeColors.green_800,
            "900": themeContext?.green_900 || process?.env?.THEME_GREEN_900 || themeColors.green_900,
        },
        red: {
            "50": themeContext?.red_50 || process?.env?.THEME_RED_50 || themeColors.red_50,
            "100": themeContext?.red_100 || process?.env?.THEME_RED_100 || themeColors.red_100,
            "200": themeContext?.red_200 || process?.env?.THEME_RED_200 || themeColors.red_200,
            "300": themeContext?.red_300 || process?.env?.THEME_RED_300 || themeColors.red_300,
            "400": themeContext?.red_400 || process?.env?.THEME_RED_400 || themeColors.red_400,
            "500": themeContext?.red_500 || process?.env?.THEME_RED_500 || themeColors.red_500,
            "600": themeContext?.red_600 || process?.env?.THEME_RED_600 || themeColors.red_600,
            "700": themeContext?.red_700 || process?.env?.THEME_RED_700 || themeColors.red_700,
            "800": themeContext?.red_800 || process?.env?.THEME_RED_800 || themeColors.red_800,
            "900": themeContext?.red_900 || process?.env?.THEME_RED_900 || themeColors.red_900,
        },
        purple: {
            "50": "#F4EDF7",
            "100": "#E1CDE9",
            "200": "#CDADDB",
            "300": "#B98DCD",
            "400": "#A66DBF",
            "500": "#924EB1",
            "600": "#753E8E",
            "700": "#582F6A",
            "800": "#3A1F47",
            "900": "#1D1023",
        },
    }
}

export function getTheme(themeContext?: GetThemeResponse | null) {
    return extendTheme({
        colors: getColors(themeContext),
        fonts: {
            heading: "var(--font-poppins)",
            body: "var(--font-poppins)",
        },
        components: {
            Heading: {
                baseStyle: {
                    fontWeight: 400,
                },
            },
            Input: {
                variants: {
                    text: {
                        field: {
                            backgroundColor: "#F5F5F5",
                            _placeholder: {
                                color: "#B1B1B1",
                            },
                            borderRadius: "25px",
                            height: "50px",
                            padding: "20px",
                        },
                        addon: {
                            borderRadius: 0,
                            bg: "#023543",
                            borderBottom: `2px solid #4FB1B8`,
                        },
                    },
                },
                defaultProps: {
                    variant: "text",
                },
            },
            Textarea: {
                variants: {
                    text: {
                        backgroundColor: "#F5F5F5",
                        _placeholder: {
                            color: "#B1B1B1",
                        },
                        borderRadius: "3px",
                        height: "150px",
                        padding: "20px",
                    },
                },
                defaultProps: {
                    variant: "text",
                },
            },
            Button: {
                baseStyle: {
                    borderRadius: "3px",
                    minWidth: "120px",
                    fontWeight: "normal",
                },
                variants: {
                    solid: {
                        height: "50px",
                        textTransform: "uppercase",
                        _hover: {
                            //backgroundColor : "#f00"
                        },
                    },
                },
            },
            Select: {
                variants: {
                    unstyled: {
                        field: {
                            backgroundColor: "#F5F5F5",
                            _placeholder: {
                                color: "#B1B1B1",
                            },
                            borderRadius: "25px",
                            height: "50px",
                            px: "20px",
                        },
                    },
                },
            },
            Menu: {
                variants: {
                    standard: {
                        list: {
                            backgroundColor: "#fff",
                            padding: 0,
                            border: "none",
                            borderRadius: "3px",
                            overflow: "hidden",
                            zIndex: 100,
                        },
                        item: {
                            padding: 3,
                        },
                    },
                },
                defaultProps: {
                    variant: "standard",
                },
            },
        },
    })
}
