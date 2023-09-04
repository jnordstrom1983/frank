import { extendTheme } from "@chakra-ui/react"
const colors = {
    blue: {
        "50": "#F0F2F5",
        "100": "#D5DCE2",
        "200": "#BAC5CF",
        "300": "#9FAFBC",
        "400": "#8498A9",
        "500": "#698296",
        "600": "#546878",
        "700": "#3F4E5A",
        "800": "#2A343C",
        "900": "#151A1E",
    },
    green: {
        "50": "#F0F5F3",
        "100": "#D5E2DC",
        "200": "#BACFC6",
        "300": "#9EBCAF",
        "400": "#83AA99",
        "500": "#689783",
        "600": "#537968",
        "700": "#3E5B4E",
        "800": "#2A3C34",
        "900": "#151E1A",
    },
    red: {
        "50": "#F4F0F0",
        "100": "#E1D5D6",
        "200": "#CEBBBC",
        "300": "#BBA0A2",
        "400": "#A88587",
        "500": "#946B6D",
        "600": "#775557",
        "700": "#594041",
        "800": "#3B2B2C",
        "900": "#1E1516",
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

export const theme = extendTheme({
    colors,
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
