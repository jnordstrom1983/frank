import { BlockType } from "@/components/FieldEditors/Block/BlockEditor"
import { dataType } from "@/models/datatype"

export enum Permissions {
    none = "none",
    demo = "demo",
}

export enum errorCodes {
    unknown = 0,
    invalidResponseData = 1,
    invalidRequestBody = 2,
    invalidCodeOrToken = 3,
    forbidden = 403,
    unauthorized = 401,
    notFound = 404,
}

export enum dbCollection {
    user = "user",
    spaceUser = "space_user",
    space = "space",
    contentType = "contenttype",
    folder = "folder",
    content = "content",
    contentData = "contentdata",
    history = "history",
    trash = "trash",
    aiTask = "aitask",
    accessKey = "accesskey",
    webhook = "webhook",
    webhookEvent = "webhookevent",
    asset = "asset",
    assetFolder = "assetFolder",
    migration = "migration"

}

export const dataTypes: dataType[] = [
    {
        id: "string",
        name: "string",
        description: "Regular text",
        variants: [
            {
                id: "textbox",
                name: "textbox",
                options: "enabled",
                optionsType: "string",
                canBeTitle: true,
                validators: {
                    required: { enabled: false },
                    unique: { enabled: false },
                    maxLength: { enabled: true, max: 4096 },
                    minLength: { enabled: false, min: 0 },
                },
                settings: [
                    { id: "defaultValue", name: "Default value", type: "textbox" }
                ],
                ai: {
                    check: true,
                    translate: true,
                    reprahse: false,
                },

            },
            {
                id: "textarea",
                name: "textarea",
                options: "enabled",
                optionsType: "string",
                canBeTitle: true,
                validators: {
                    required: { enabled: false },
                    unique: { enabled: false },
                    maxLength: { enabled: true, max: 255 },
                    minLength: { enabled: false, min: 0 },
                },
                settings: [
                    { id: "defaultValue", name: "Default value", type: "textbox" }
                ],
                ai: {
                    check: true,
                    translate: true,
                    reprahse: false,
                },

            },
            {
                id: "select",
                name: "select",
                options: "mandatory",
                optionsType: "string",
                canBeTitle: true,
                validators: {
                    required: { enabled: false },
                    unique: { enabled: false },
                },
                settings: [
                    { id: "defaultValue", name: "Default value", type: "textbox" }
                ],
                ai: {
                    check: false,
                    translate: false,
                    reprahse: false,
                },

            },
        ],
    },
    {
        id: "number",
        name: "number",
        description: "Regular number",
        variants: [
            {
                id: "textbox",
                name: "textbox",
                options: "enabled",
                optionsType: "number",
                canBeTitle: true,
                validators: {
                    required: { enabled: false },
                    unique: { enabled: false },
                    maxValue: { enabled: false, max: 10000 },
                    minValue: { enabled: false, min: 0 },
                },
                settings: [],
                ai: {
                    check: false,
                    translate: false,
                    reprahse: false,
                },

            },
            {
                id: "select",
                name: "select",
                options: "mandatory",
                optionsType: "number",
                canBeTitle: true,
                validators: {
                    required: { enabled: false },
                    unique: { enabled: false },
                },
                settings: [],
                ai: {
                    check: false,
                    translate: false,
                    reprahse: false,
                },

            },
        ],
    },

    {
        id: "reference",
        name: "reference",
        description: "Reference to content item",
        variants: [
            {
                id: "reference",
                name: "Content reference",
                options: "disabled",
                canBeTitle: false,
                validators: {
                    required: { enabled: false },
                },
                settings: [
                    { id: "contenttypes", name: "Content types", type: "contenttypes", data: { all: "Allow any type of content", value: ["__all__"] } },
                    { id: "select", name: "Select content", type: "checkbox", data: { description: "Allow to select already existing content", checked: true } },
                    { id: "create", name: "Create content", type: "checkbox", data: { description: "Allow to create new content", checked: true } },
                    { id: "edit", name: "Edit content", type: "checkbox", data: { description: "Allow to edit referenced content", checked: false } }
                ],
                ai: {
                    check: false,
                    translate: false,
                    reprahse: false,
                },

            },

        ],
    },
    {
        id: "referenceArray",
        name: "reference[]",
        description: "Reference to multiple content items",
        variants: [
            {
                id: "reference",
                name: "Content references",
                options: "disabled",
                canBeTitle: false,
                defaultValue: [],
                validators: {
                    required: { enabled: false },
                },
                settings: [
                    { id: "contenttypes", name: "Content types", type: "contenttypes", data: { all: "Allow any type of content", value: ["__all__"] } },
                    { id: "select", name: "Select content", type: "checkbox", data: { description: "Allow to select already existing content", checked: true } },
                    { id: "create", name: "Create content", type: "checkbox", data: { description: "Allow to create new content", checked: true } },
                    { id: "edit", name: "Edit content", type: "checkbox", data: { description: "Allow to edit referenced content", checked: false } }
                ],
                ai: {
                    check: false,
                    translate: false,
                    reprahse: false,
                },

            },

        ],
    },
    {
        id: "asset",
        name: "asset",
        description: "Reference to asset",
        variants: [
            {
                id: "asset",
                name: "Asset",
                options: "disabled",
                canBeTitle: false,
                validators: {
                    required: { enabled: false },
                },
                settings: [
                    { id: "select", name: "Select assets", type: "checkbox", data: { description: "Allow to select already existing assets", checked: true } },
                    { id: "create", name: "Create assets", type: "checkbox", data: { description: "Allow to create new assets", checked: true } },
                    { id: "image", name: "Images only", type: "checkbox", data: { description: "Only allow images", checked: true } },
                    { id: "width", name: "Fixed width", type: "checkboxInput", data: { description: "Resize to" } },
                    { id: "height", name: "Fixed height", type: "checkboxInput", data: { description: "Resize to" } },

                ],
                ai: {
                    check: false,
                    translate: false,
                    reprahse: false,
                },

            },

        ],
    },
    {
        id: "assetArray",
        name: "asset[]",
        description: "Reference to multiple assets",
        variants: [
            {
                id: "asset",
                name: "Assets",
                options: "disabled",
                defaultValue: [],
                canBeTitle: false,
                validators: {
                    required: { enabled: false },
                },
                settings: [
                    { id: "select", name: "Select assets", type: "checkbox", data: { description: "Allow to select already existing assets", checked: true } },
                    { id: "create", name: "Create assets", type: "checkbox", data: { description: "Allow to create new assets", checked: true } },
                    { id: "image", name: "Images only", type: "checkbox", data: { description: "Only allow images", checked: true } },
                    { id: "width", name: "Fixed width", type: "checkboxInput", data: { description: "Resize to" } },
                    { id: "height", name: "Fixed height", type: "checkboxInput", data: { description: "Resize to" } },

                ],
                ai: {
                    check: false,
                    translate: false,
                    reprahse: false,
                },

            },

        ],
    },

    {
        id: "blocks",
        name: "blocks",
        description: "Content blocks of various types",
        variants: [
            {
                id: "array",
                name: "Blocks",
                options: "disabled",
                canBeTitle: false,
                defaultValue: [],
                validators: {

                },
                settings: [
                    {
                        id: "blocktypes", name: "Allowed block types", type: "checkboxes", data: {
                            items: [
                                { key: "heading", text: "Heading" },
                                { key: "quote", text: "Quote" },
                                { key: "code", text: "Code" },
                                { key: "asset", text: "Embedded file / image" },
                                { key: "list", text: "List" },
                                { key: "reference", text: "Embedded content" },
                                { key: "table", text: "Table" },
                                { key: "divider", text: "Divider" },
                            ]
                        }
                    }

                ],
                ai: {
                    check: false,
                    translate: false,
                    reprahse: false,
                },

            },

        ],
    },
    {
        id: "table",
        name: "table",
        description: "Table made of rows and columns",
        variants: [
            {
                id: "table",
                name: "Table",
                options: "disabled",
                canBeTitle: false,
                defaultValue: [["", ""], ["", ""]],
                validators: {

                },
                settings: [
                ],
                ai: {
                    check: false,
                    translate: false,
                    reprahse: false,
                },

            },

        ],
    },

    {
        id: "object",
        name: "object",
        description: "Single item of structured data of specified properties",
        variants: [
            {
                id: "object",
                name: "Object",
                options: "disabled",
                canBeTitle: false,
                defaultValue: {},
                validators: {

                },
                settings: [
                    { id: "properties", name: "Properties", type: "objectProperties", data: {} },
                ],
                ai: {
                    check: false,
                    translate: false,
                    reprahse: false,
                },

            },

        ],
    },

    {
        id: "objectArray",
        name: "object[]",
        description: "Multiple objects of structured data with specified properties",
        variants: [
            {
                id: "objects",
                name: "Objects",
                options: "disabled",
                canBeTitle: false,
                defaultValue: [],
                validators: {

                },
                settings: [
                    { id: "properties", name: "Properties", type: "objectProperties", data: {} },
                ],
                ai: {
                    check: false,
                    translate: false,
                    reprahse: false,
                },

            },

        ],
    },


]



export const blockTypes: BlockType[] = [
    {
        id: "paragraph",
        name: "Paragraph",
        defaultData: "",
        defaultVariant: "normal",
        variants: ["normal", "bold", "italic", "underline"],
        convertsTo: ["heading", "quote", "code"],
    },
    {
        id: "heading",
        name: "Heading",
        defaultData: "",
        defaultVariant: "large",
        variants: ["large", "medium", "small"],
        convertsTo: ["paragraph", "quote", "code"],
    },
    {
        id: "quote",
        name: "Quote",
        defaultData: "",
        defaultVariant: "standard",
        variants: ["stadard"],
        convertsTo: ["paragraph", "heading", "code"],
    },
    {
        id: "code",
        name: "Code block",
        defaultData: "",
        defaultVariant: "standard",
        variants: ["stadard"],
        convertsTo: ["paragraph", "heading", "quote"],
    },
    {
        id: "asset",
        name: "Embeded file / image",
        defaultData: [] as string[],
        defaultVariant: "asset",
        variants: ["asset"],
        convertsTo: [],
    },
    {
        id: "list",
        name: "List",
        defaultData: "",
        defaultVariant: "ordered",
        variants: ["ordered", "unordered"],
        convertsTo: [],
    },
    {
        id: "reference",
        name: "Embeded content",
        defaultData: [] as string[],
        defaultVariant: "reference",
        variants: ["reference", "references"],
        convertsTo: [],
    },
    {
        id: "table",
        name: "Table",
        defaultData: [["", ""], ["", ""]] as string[][],
        defaultVariant: "table",
        variants: ["table"],
        convertsTo: [],
    },
    {
        id: "divider",
        name: "Divider",
        defaultData: "",
        defaultVariant: "divider",
        variants: ["divider"],
        convertsTo: [],
    },
]


export const languages = [
    { code: "aa", name: "Afar" },
    { code: "ab", name: "Abkhazian" },
    { code: "ae", name: "Avestan" },
    { code: "af", name: "Afrikaans" },
    { code: "ak", name: "Akan" },
    { code: "am", name: "Amharic" },
    { code: "an", name: "Aragonese" },
    { code: "ar", name: "Arabic" },
    { code: "as", name: "Assamese" },
    { code: "av", name: "Avaric" },
    { code: "ay", name: "Aymara" },
    { code: "az", name: "Azerbaijani" },
    { code: "ba", name: "Bashkir" },
    { code: "be", name: "Belarusian" },
    { code: "bg", name: "Bulgarian" },
    { code: "bh", name: "Bihari languages" },
    { code: "bi", name: "Bislama" },
    { code: "bm", name: "Bambara" },
    { code: "bn", name: "Bengali" },
    { code: "bo", name: "Tibetan" },
    { code: "br", name: "Breton" },
    { code: "bs", name: "Bosnian" },
    { code: "ca", name: "Catalan; Valencian" },
    { code: "ce", name: "Chechen" },
    { code: "ch", name: "Chamorro" },
    { code: "co", name: "Corsican" },
    { code: "cr", name: "Cree" },
    { code: "cs", name: "Czech" },
    { code: "cu", name: "Church Slavic" },
    { code: "cv", name: "Chuvash" },
    { code: "cy", name: "Welsh" },
    { code: "da", name: "Danish" },
    { code: "de", name: "German" },
    { code: "dv", name: "Divehi; Dhivehi; Maldivian" },
    { code: "dz", name: "Dzongkha" },
    { code: "ee", name: "Ewe" },
    { code: "el", name: "Greek, Modern (1453-)" },
    { code: "en", name: "English" },
    { code: "eo", name: "Esperanto" },
    { code: "es", name: "Spanish; Castilian" },
    { code: "et", name: "Estonian" },
    { code: "eu", name: "Basque" },
    { code: "fa", name: "Persian" },
    { code: "ff", name: "Fulah" },
    { code: "fi", name: "Finnish" },
    { code: "fj", name: "Fijian" },
    { code: "fo", name: "Faroese" },
    { code: "fr", name: "French" },
    { code: "fy", name: "Western Frisian" },
    { code: "ga", name: "Irish" },
    { code: "gd", name: "Gaelic; Scomttish Gaelic" },
    { code: "gl", name: "Galician" },
    { code: "gn", name: "Guarani" },
    { code: "gu", name: "Gujarati" },
    { code: "gv", name: "Manx" },
    { code: "ha", name: "Hausa" },
    { code: "he", name: "Hebrew" },
    { code: "hi", name: "Hindi" },
    { code: "ho", name: "Hiri Motu" },
    { code: "hr", name: "Croatian" },
    { code: "ht", name: "Haitian; Haitian Creole" },
    { code: "hu", name: "Hungarian" },
    { code: "hy", name: "Armenian" },
    { code: "hz", name: "Herero" },
    { code: "ia", name: "Interlingua" },
    { code: "id", name: "Indonesian" },
    { code: "ie", name: "Interlingue; Occidental" },
    { code: "ig", name: "Igbo" },
    { code: "ii", name: "Sichuan Yi; Nuosu" },
    { code: "ik", name: "Inupiaq" },
    { code: "io", name: "Ido" },
    { code: "is", name: "Icelandic" },
    { code: "it", name: "Italian" },
    { code: "iu", name: "Inuktitut" },
    { code: "ja", name: "Japanese" },
    { code: "jv", name: "Javanese" },
    { code: "ka", name: "Georgian" },
    { code: "kg", name: "Kongo" },
    { code: "ki", name: "Kikuyu; Gikuyu" },
    { code: "kj", name: "Kuanyama; Kwanyama" },
    { code: "kk", name: "Kazakh" },
    { code: "kl", name: "Kalaallisut; Greenlandic" },
    { code: "km", name: "Central Khmer" },
    { code: "kn", name: "Kannada" },
    { code: "ko", name: "Korean" },
    { code: "kr", name: "Kanuri" },
    { code: "ks", name: "Kashmiri" },
    { code: "ku", name: "Kurdish" },
    { code: "kv", name: "Komi" },
    { code: "kw", name: "Cornish" },
    { code: "ky", name: "Kirghiz; Kyrgyz" },
    { code: "la", name: "Latin" },
    { code: "lb", name: "Luxembourgish; Letzeburgesch" },
    { code: "lg", name: "Ganda" },
    { code: "li", name: "Limburgan; Limburger; Limburgish" },
    { code: "ln", name: "Lingala" },
    { code: "lo", name: "Lao" },
    { code: "lt", name: "Lithuanian" },
    { code: "lu", name: "Luba-Katanga" },
    { code: "lv", name: "Latvian" },
    { code: "mg", name: "Malagasy" },
    { code: "mh", name: "Marshallese" },
    { code: "mi", name: "Maori" },
    { code: "mk", name: "Macedonian" },
    { code: "ml", name: "Malayalam" },
    { code: "mn", name: "Mongolian" },
    { code: "mr", name: "Marathi" },
    { code: "ms", name: "Malay" },
    { code: "mt", name: "Maltese" },
    { code: "my", name: "Burmese" },
    { code: "na", name: "Nauru" },
    { code: "nb", name: "Norwegian Bokmål" },
    { code: "nd", name: "Ndebele, North; North Ndebele" },
    { code: "ne", name: "Nepali" },
    { code: "ng", name: "Ndonga" },
    { code: "nl", name: "Dutch; Flemish" },
    { code: "nn", name: "Norwegian Nynorsk; Nynorsk, Norwegian" },
    { code: "no", name: "Norwegian" },
    { code: "nr", name: "Ndebele, South; South Ndebele" },
    { code: "nv", name: "Navajo; Navaho" },
    { code: "ny", name: "Chichewa; Chewa; Nyanja" },
    { code: "oc", name: "Occitan (post 1500)" },
    { code: "oj", name: "Ojibwa" },
    { code: "om", name: "Oromo" },
    { code: "or", name: "Oriya" },
    { code: "os", name: "Ossetian; Ossetic" },
    { code: "pa", name: "Panjabi; Punjabi" },
    { code: "pi", name: "Pali" },
    { code: "pl", name: "Polish" },
    { code: "ps", name: "Pushto; Pashto" },
    { code: "pt", name: "Portuguese" },
    { code: "qu", name: "Quechua" },
    { code: "rm", name: "Romansh" },
    { code: "rn", name: "Rundi" },
    { code: "ro", name: "Romanian; Moldavian; Moldovan" },
    { code: "ru", name: "Russian" },
    { code: "rw", name: "Kinyarwanda" },
    { code: "sa", name: "Sanskrit" },
    { code: "sc", name: "Sardinian" },
    { code: "sd", name: "Sindhi" },
    { code: "se", name: "Northern Sami" },
    { code: "sg", name: "Sango" },
    { code: "si", name: "Sinhala; Sinhalese" },
    { code: "sk", name: "Slovak" },
    { code: "sl", name: "Slovenian" },
    { code: "sm", name: "Samoan" },
    { code: "sn", name: "Shona" },
    { code: "so", name: "Somali" },
    { code: "sq", name: "Albanian" },
    { code: "sr", name: "Serbian" },
    { code: "ss", name: "Swati" },
    { code: "st", name: "Sotho, Southern" },
    { code: "su", name: "Sundanese" },
    { code: "sv", name: "Swedish" },
    { code: "sw", name: "Swahili" },
    { code: "ta", name: "Tamil" },
    { code: "te", name: "Telugu" },
    { code: "tg", name: "Tajik" },
    { code: "th", name: "Thai" },
    { code: "ti", name: "Tigrinya" },
    { code: "tk", name: "Turkmen" },
    { code: "tl", name: "Tagalog" },
    { code: "tn", name: "Tswana" },
    { code: "to", name: "Tonga (Tonga Islands)" },
    { code: "tr", name: "Turkish" },
    { code: "ts", name: "Tsonga" },
    { code: "tt", name: "Tatar" },
    { code: "tw", name: "Twi" },
    { code: "ty", name: "Tahitian" },
    { code: "ug", name: "Uighur; Uyghur" },
    { code: "uk", name: "Ukrainian" },
    { code: "ur", name: "Urdu" },
    { code: "uz", name: "Uzbek" },
    { code: "ve", name: "Venda" },
    { code: "vi", name: "Vietnamese" },
    { code: "vo", name: "Volapük" },
    { code: "wa", name: "Walloon" },
    { code: "wo", name: "Wolof" },
    { code: "xh", name: "Xhosa" },
    { code: "yi", name: "Yiddish" },
    { code: "yo", name: "Yoruba" },
    { code: "za", name: "Zhuang; Chuang" },
    { code: "zh", name: "Chinese" },
    { code: "zu", name: "Zulu" },
]
