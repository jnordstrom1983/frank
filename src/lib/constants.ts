import { BlockType } from "@/components/FieldEditors/Block/BlockEditor"
import { dataType } from "@/models/datatype"
import { Field } from "@/models/field"
import { ReactElement } from "react"

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
        getDataTypeString : (field : Field)=>{
            if(field.options){
                return field.options.map(n=>`"${n}"`).join(" | ")
            }
            return "string"
        }
    },
    {
        id: "stringArray",
        name: "string[]",
        description: "Array of strings",
        variants: [
            {
                id: "tags",
                name: "tags",
                options: "enabled",
                optionsType: "string",
                canBeTitle: false,
                validators: {
                    required: { enabled: false },
                },
                settings: [
                    
                ],
                ai: {
                    check: false,
                    translate: false,
                    reprahse: false
                },

            },
       
        ],
        getDataTypeString : (field : Field)=>{
            if(field.options){
                //return field.options.map(n=>`"${n}"`).join(" | ")
            }
            return "string[]"
        }
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
        getDataTypeString : (field : Field)=>{
            if(field.options){
                return field.options.join(" | ")
            }
            return "number"
        }        
    },
    {
        id: "boolean",
        name: "boolean",
        description: "true/false value",
        variants: [

            {
                id: "select",
                name: "select",
                options: "mandatory",
                optionsType: "string",
                canBeTitle: true,
                validators: {
                    required: { enabled: false },

                },
                settings: [
                    
                ],
                defaultValue : false,
                ai: {
                    check: false,
                    translate: false,
                    reprahse: false,
                },

            },
        ],
        getDataTypeString : (field : Field)=>{
            return "boolean"
        }
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
        getDataTypeString : (field : Field)=>{
             return "string | FrankContentItem"
        }                
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
        getDataTypeString : (field : Field)=>{
            return "string | FrankContentItem[]"
        }                        
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
        getDataTypeString : (field : Field)=>{
            return `{ 
                assetId: string
                url: string
                type: string
                filename: string
                name: string
                description: string
            }`
        }            
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
        getDataTypeString : (field : Field)=>{
            return `{ 
                assetId: string
                url: string
                type: string
                filename: string
                name: string
                description: string
            }[]`
        }              
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
        getDataTypeString : (field : Field)=>{
            return `{ 
                id : string
                type : string
                variant : string
                data : any
            }[]`
        }           
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
        getDataTypeString : (field : Field)=>{
            return `string[][]`
        }           
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
        getDataTypeString : (field : Field)=>{
            return `Record<string, string>`
        }                   
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
        getDataTypeString : (field : Field)=>{
            return `Record<string, string>[]`
        }                           
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




