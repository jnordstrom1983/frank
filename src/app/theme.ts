import { extendTheme } from "@chakra-ui/react"
const colors = {
    blue: {
        "50": "#EEF3F6",
        "100": "#D0DDE6",
        "200": "#B2C8D6",
        "300": "#94B2C6",
        "400": "#769CB7",
        "500": "#5887A7",
        "600": "#476C85",
        "700": "#355164",
        "800": "#233643",
        "900": "#121B21",
    },
    green: {
        "50": "#F0F5F1",
        "100": "#D4E3D7",
        "200": "#B8D1BD",
        "300": "#9CBFA4",
        "400": "#80AD8A",
        "500": "#649B70",
        "600": "#507C5A",
        "700": "#3C5D43",
        "800": "#283E2D",
        "900": "#141F16",
    },
    red: {
        "50": "#F9ECEC",
        "100": "#EDCACA",
        "200": "#E1A7A7",
        "300": "#D68585",
        "400": "#CA6363",
        "500": "#BF4040",
        "600": "#993333",
        "700": "#722727",
        "800": "#4C1A1A",
        "900": "#260D0D",
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
                }

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
                }
            }
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
                        zIndex : 100

                    },
                    item: {
                        padding: 3,
                    }

                }
            },
            defaultProps: {
                variant: "standard",
            },

        },

    },
})
