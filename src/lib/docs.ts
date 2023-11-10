import { USER_USERID_DOC } from "@/app/api/user/[userid]/doc";
import { USER_DOC } from "@/app/api/user/doc";
import { USER_LOGIN_DOC } from "@/app/api/user/login/doc";
import { OpenAPIRegistry, OpenApiGeneratorV3, RouteConfig, extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { ZodError, ZodObject, ZodOptional, ZodString, any, z } from "zod";
import { errorResponseSchema } from "./apiUtils";
import { USER_VERIFY_DOC } from "@/app/api/user/verify/doc";
import { USER_PROFILE_DOC } from "@/app/api/user/profile/doc";
import { USER_TOKEN_DOC } from "@/app/api/user/token/doc";
import { errorCodes } from "./constants";
import { SPACE_ACCESSKEY_DOC } from "@/app/api/space/[spaceid]/accesskey/doc";
import { SPACE_ACCESSKEY_KEYID_DOC } from "@/app/api/space/[spaceid]/accesskey/[keyid]/doc";
import { SPACE_AI_DOC } from "@/app/api/space/[spaceid]/ai/doc";
import { SPACE_AI_TASKID_DOC } from "@/app/api/space/[spaceid]/ai/task/[taskid]/doc";
import { SPACE_ASSET_DOC } from "@/app/api/space/[spaceid]/asset/doc";
import { SPACE_ASSET_ASSETID_DOC } from "@/app/api/space/[spaceid]/asset/[assetid]/doc";
import { SPACE_ASSET_FOLDER_DOC } from "@/app/api/space/[spaceid]/asset/folder/doc";
import { SPACE_ASSET_FOLDER_FOLDERID_DOC } from "@/app/api/space/[spaceid]/asset/folder/[folderid]/doc";
import { SPACE_CONTENT_DOC } from "@/app/api/space/[spaceid]/content/doc";
import { SPACE_CONTENT_CONTENTID_DOC } from "@/app/api/space/[spaceid]/content/[contentid]/doc";
import { SPACE_CONTENT_HISTORY_HISTORYID_DOC } from "@/app/api/space/[spaceid]/content/[contentid]/history/[historyid]/doc";
import { SPACE_CONTENTTYPE_DOC } from "@/app/api/space/[spaceid]/contenttype/doc";
import { SPACE_CONTENTTYPE_CONTENTTYPEID_DOC } from "@/app/api/space/[spaceid]/contenttype/[contenttypeid]/doc";
import { SPACE_FOLDER_DOC } from "@/app/api/space/[spaceid]/folder/doc";
import { SPACE_FOLDER_FOLDERID_DOC } from "@/app/api/space/[spaceid]/folder/[folderid]/doc";
import { SPACE_USER_DOC } from "@/app/api/space/[spaceid]/user/doc";
import { SPACE_USER_USERID_DOC } from "@/app/api/space/[spaceid]/user/[userid]/doc";
import { SPACE_USER_API_DOC } from "@/app/api/space/[spaceid]/user/api/doc";
import { SPACE_USER_API_USERID_DOC } from "@/app/api/space/[spaceid]/user/api/[userid]/doc";
import { SPACE_WEBHOOK_DOC } from "@/app/api/space/[spaceid]/webhook/doc";
import { SPACE_WEBHOOK_WEBHOOKID_DOC } from "@/app/api/space/[spaceid]/webhook/[webhookid]/doc";
import { SPACE_DOC as SPACE_DOC_SPACEID } from "@/app/api/space/[spaceid]/doc";
import { SPACE_DOC } from "@/app/api/space//doc";
import { CONTENT_DOC } from "@/app/content/[spaceid]/doc";
import { SpaceLanguageEnum } from "@/models/space";
import { SPACE_TRASH_DOC } from "@/app/api/space/[spaceid]/trash/doc";
import { SPACE_LINK_LINKID_DOC } from "@/app/api/space/[spaceid]/link/[linkid]/doc";
import { SPACE_LINK_DOC } from "@/app/api/space/[spaceid]/link/doc";
extendZodWithOpenApi(z);


const paramsEmumSchema = z.enum(["spaceid", "userid", "keyid", "taskid", "assetid", "folderid", "contentid", "historyid", "contenttypeid", "webhookid", "linkid"])
type paramsEnum = z.infer<typeof paramsEmumSchema>

type errorResponse = z.infer<typeof errorResponseSchema>
interface routeErrors {
    ERROR_NOTFOUND?: string
    ERROR_CONFLICT?: string
    CUSTOM?: { statusCode: number, description: string, schema: ZodObject<any, any> }[]
}



export interface generateRouteInfoParams {
    path: string,
    tags: string[],
    method: "post" | "get" | "put" | "delete",
    summary: string,
    requiresAuth: "none" | "user-jwt-token" | "content"
    params: paramsEnum[],
    query?: paramsEnum[]
    requestSchema?: z.ZodType<unknown, z.ZodTypeDef, unknown>,
    responseSchema: z.ZodType<unknown, z.ZodTypeDef, unknown>,
    responseDescription: string,
    errors: routeErrors
    customRequestContentType?: string

}


export function generateRouteDoc(routeInfo: generateRouteInfoParams, params: Record<string, ZodString | ZodOptional<ZodString>>, apiUrl: string = "/api"): RouteConfig {

    let config: RouteConfig = {
        method: routeInfo.method,
        path: routeInfo.path,
        summary: routeInfo.summary,
        tags: routeInfo.tags,

        servers: [{ url: apiUrl }],
        request: {
            body: {
                content: {

                },
            }
        },
        responses: {
            200: {
                description: routeInfo.responseDescription,
                content: {
                    'application/json': {
                        schema: routeInfo.responseSchema
                    },
                },
            },
        }
    }

    if (routeInfo.errors.ERROR_NOTFOUND) {
        config.responses[404] = {
            description: routeInfo.errors.ERROR_NOTFOUND,
            content: {
                'application/json': {
                    schema: z.object({
                        code: z.literal(404),
                        message: z.string(),
                        error: z.any().optional(),
                    })
                },
            },
        }
    }
    if (routeInfo.requiresAuth) {
        config.responses[401] = {
            description: "Unauthorized / Permission denied",
            content: {
                'application/json': {
                    schema: z.object({
                        code: z.literal(401),
                        message: z.string(),
                    })
                },
            },
        }
    }
    if (routeInfo.requestSchema) {
        config.responses[422] = {
            description: "Unprocessable entity",
            content: {
                'application/json': {
                    schema: z.object({
                        code: z.literal(errorCodes.invalidRequestBody),
                        message: z.literal("Request body did not validate"),
                        error: z.any()
                    })
                },
            },
        }

    }

    if (routeInfo.errors.ERROR_CONFLICT) {
        config.responses[409] = {
            description: routeInfo.errors.ERROR_CONFLICT,
            content: {
                'application/json': {
                    schema: z.object({
                        code: z.literal(409),
                        message: z.string(),
                        error: z.literal("Conflict")
                    })
                },
            },
        }
    }
    if (routeInfo.errors.CUSTOM) {
        routeInfo.errors.CUSTOM.forEach(error => {
            config.responses[error.statusCode] = {
                description: error.description,
                content: {
                    'application/json': {
                        schema: error.schema
                    },
                },
            }
        })
    }


    if (routeInfo.requestSchema) {
        if (routeInfo.customRequestContentType) {
            config.request!.body!.content = {}
            config.request!.body!.content[routeInfo.customRequestContentType] = {
                schema: routeInfo.requestSchema
            }
        } else {
            config.request!.body!.content = {
                "application/json": {
                    schema: routeInfo.requestSchema
                }
            }
        }

    }
    if (routeInfo.requiresAuth != "none") {
        config.security = [{ [routeInfo.requiresAuth]: [] }]
    }

    let configParamsInfo: { [key: string]: ZodString | ZodOptional<ZodString> } = {}
    routeInfo.params.forEach(p => {
        const par = params[p];

        configParamsInfo[p] = par;
    })

    config.request!.params = z.object(configParamsInfo)

    if (routeInfo.query) {
        let configQueryInfo: { [key: string]: ZodString | ZodOptional<ZodString> } = {}
        routeInfo.query.forEach(p => {
            const par = params[p];

            configQueryInfo[p] = par;
        })
        config.request!.query = z.object(configQueryInfo)

    }



    return config;

}

function registerParams(registry: OpenAPIRegistry, spaceId: string): Record<string, ZodString> {
    let params: Record<string, ZodString> = {}

    params["spaceid"] = registry.registerParameter(
        'spaceid',
        z.string().openapi({
            param: {
                name: 'spaceid',
                in: 'path',
            },
            example: spaceId,
        })
    );

    params["userid"] = registry.registerParameter(
        'userid',
        z.string().openapi({
            param: {
                name: 'userid',
                in: 'path',
            },
            example: "u000000000000000000001",
        })
    );

    params["keyid"] = registry.registerParameter(
        'keyid',
        z.string().openapi({
            param: {
                name: 'keyid',
                in: 'path',
            },
            example: "k000000000000000000001",
        })
    );

    params["taskid"] = registry.registerParameter(
        'taskid',
        z.string().openapi({
            param: {
                name: 'taskid',
                in: 'path',
            },
            example: "t000000000000000000001",
        })
    );

    params["assetid"] = registry.registerParameter(
        'assetid',
        z.string().openapi({
            param: {
                name: 'assetid',
                in: 'path',
            },
            example: "a000000000000000000001",
        })
    );

    params["folderid"] = registry.registerParameter(
        'folderid',
        z.string().openapi({
            param: {
                name: 'folderid',
                in: 'path',
            },
            example: "f000000000000000000001",
        })
    );

    params["contentid"] = registry.registerParameter(
        'contentid',
        z.string().openapi({
            param: {
                name: 'contentid',
                in: 'path',
            },
            example: "c000000000000000000001",
        })
    );

    params["historyid"] = registry.registerParameter(
        'historyid',
        z.string().openapi({
            param: {
                name: 'historyid',
                in: 'path',
            },
            example: "h000000000000000000001",
        })
    );

    params["contenttypeid"] = registry.registerParameter(
        'contenttypeid',
        z.string().openapi({
            param: {
                name: 'contenttypeid',
                in: 'path',
            },
            example: "ct00000000000000000001",
        })
    );

    params["webhookid"] = registry.registerParameter(
        'webhookid',
        z.string().openapi({
            param: {
                name: 'webhookid',
                in: 'path',
            },
            example: "w000000000000000000001",
        })
    );

    params["linkid"] = registry.registerParameter(
        'linkid',
        z.string().openapi({
            param: {
                name: 'linkid',
                in: 'path',
            },
            example: "l000000000000000000001",
        })
    );











    return params;

}

function registerAuth(registry: OpenAPIRegistry) {
    const bearerAuth = registry.registerComponent('securitySchemes', 'user-jwt-token', {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
    });

}
export function generateFrankDocs() {
    const registry = new OpenAPIRegistry();
    const params = registerParams(registry, "s0000000000000000000")
    registerAuth(registry)


    let allRoutes: generateRouteInfoParams[] = [
        ...USER_DOC,
        ...USER_USERID_DOC,
        ...USER_LOGIN_DOC,
        ...USER_VERIFY_DOC,
        ...USER_PROFILE_DOC,
        ...USER_TOKEN_DOC,
        ...SPACE_DOC
    ];


    allRoutes.forEach(r => {
        registry.registerPath(generateRouteDoc(r, params))
    })

    const generator = new OpenApiGeneratorV3(registry.definitions);

    const doc = generator.generateDocument({
        openapi: '3.0.0',
        info: {
            version: '1.0.0',
            title: 'Frank Management API',
            description: 'This is the management API for your Frank installation.',
        },
        servers: [{ url: '/api' }],
    })

    return doc
}
export function generateSpaceDocs(spaceId: string) {
    const registry = new OpenAPIRegistry();
    const params = registerParams(registry, spaceId)
    registerAuth(registry)


    let allRoutes: generateRouteInfoParams[] = [
        ...USER_LOGIN_DOC,
        ...USER_VERIFY_DOC,
        ...SPACE_ACCESSKEY_DOC,
        ...SPACE_ACCESSKEY_KEYID_DOC,
        ...SPACE_AI_DOC,
        ...SPACE_AI_TASKID_DOC,
        ...SPACE_ASSET_DOC,
        ...SPACE_ASSET_ASSETID_DOC,
        ...SPACE_ASSET_FOLDER_DOC,
        ...SPACE_ASSET_FOLDER_FOLDERID_DOC,
        ...SPACE_CONTENT_DOC,
        ...SPACE_CONTENT_CONTENTID_DOC,
        ...SPACE_CONTENT_HISTORY_HISTORYID_DOC,
        ...SPACE_CONTENTTYPE_DOC,
        ...SPACE_CONTENTTYPE_CONTENTTYPEID_DOC,
        ...SPACE_FOLDER_DOC,
        ...SPACE_FOLDER_FOLDERID_DOC,
        ...SPACE_USER_DOC,
        ...SPACE_USER_USERID_DOC,
        ...SPACE_USER_API_DOC,
        ...SPACE_USER_API_USERID_DOC,
        ...SPACE_WEBHOOK_DOC,
        ...SPACE_WEBHOOK_WEBHOOKID_DOC,
        ...SPACE_DOC_SPACEID,
        ...SPACE_TRASH_DOC,
        ...SPACE_LINK_DOC,
        ...SPACE_LINK_LINKID_DOC,
        

    ];


    allRoutes.forEach(r => {
        registry.registerPath(generateRouteDoc(r, params))
    })

    const generator = new OpenApiGeneratorV3(registry.definitions);

    const doc = generator.generateDocument({
        openapi: '3.0.0',
        info: {
            version: '1.0.0',
            title: 'Frank Space API',
            description: 'This is the management API for a space in your Frank installation. You can manage all entities in your space via this API.',
        },
        servers: [{ url: '/api' }],
    })

    return doc


}



export function generateContentDocs(spaceId: string) {
    const registry = new OpenAPIRegistry();


    const bearerAuth = registry.registerComponent('securitySchemes', 'content', {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'string',
        description: "Optional Content Access Key.",

    });


    let params: Record<string, ZodString | ZodOptional<ZodString>> = {}

    params["spaceid"] = registry.registerParameter(
        'spaceid',
        z.string().openapi({
            param: {
                name: 'spaceid',
                in: 'path',
            },
            example: spaceId,
        })
    );


    params["contentid"] = registry.registerParameter(
        'contentid',
        z.string().openapi({
            param: {
                name: 'contentid',
                in: 'path',
            },
            example: "c000000000000000000001",
        })
    );



    params["contentTypeId"] = registry.registerParameter('contentTypeId', z.string().openapi({
        param: {
            name: 'contentTypeId',
            in: 'query',
        },
        description: "Comma separated list of content types",
        example: "c000000000000000000001",
    }).optional())

    params["contentId"] = registry.registerParameter('contentId', z.string().openapi({
        param: {
            name: 'contentId',
            in: 'query',
        },
        description: "Comma separated list of contentIds",
        example: "c000000000000000000001",
    }).optional())

    params["slug"] = registry.registerParameter('slug', z.string().openapi({
        param: {
            name: 'slug',
            in: 'query',
        },
        description: "Comma separated list of slugs to query",
        example: "doc1,news-item",
    }).optional())

    params["folderId"] = registry.registerParameter('folderId', z.string().openapi({
        param: {
            name: 'folderId',
            in: 'query',
        },
        description: "Comma separated list of folderIds",
        example: "folder-to-include",
    }).optional())


    params["languageId"] = registry.registerParameter('languageId', z.string().openapi({
        param: {
            name: 'languageId',
            in: 'query',
        },
        description: "Comma separated list of languages to include",
        example: "en,sv",
    }).optional())

    params["expand"] = registry.registerParameter('expand', z.string().openapi({
        param: {
            name: 'expand',
            in: 'query',
        },
        description: "Set to 'true' if referenced content should be expanded",
        example: "true",
    }).optional())

    params["expandLevels"] = registry.registerParameter('expandLevels', z.string().openapi({
        param: {
            name: 'expandLevels',
            in: 'query',
        },
        description: "How many levels to expand when expanding referenced content. Default to 1.",
        example: "3",
    }).optional())


    params["expandFallbackLanguageId"] = registry.registerParameter('expandFallbackLanguageId', z.string().openapi({
        param: {
            name: 'expandFallbackLanguageId',
            in: 'query',
        },
        description: "Language to fallback to if referenced content not availalbe in active language. Default to space default language.",
        example: "en",
    }).optional())


    params["query"] = registry.registerParameter('query', z.string().openapi({
        param: {
            name: 'query',
            in: 'query',
        },
        description: "Query Content with a MongoDB style query.",
        example: `{ "data.name" : { "$ne" : "Hello World" } }`,
    }).optional())


    params["project"] = registry.registerParameter('project', z.string().openapi({
        param: {
            name: 'project',
            in: 'query',
        },
        description: "Comma separated list of fields to return from the data property.",
        example: "name,title",
    }).optional())


    params["sort"] = registry.registerParameter('sort', z.string().openapi({
        param: {
            name: 'sort',
            in: 'query',
        },
        description: "Comma separated list of fields to sort by, or a JSON sort object.",
        example: 'data.name,data.title or { "data.name" : 1, "data.title" : -1 }',
    }).optional())

    params["sortDirection"] = registry.registerParameter('sortDirection', z.string().openapi({
        param: {
            name: 'sortDirection',
            in: 'query',
        },
        description: "Direction to sort items by (asc or desc)",
        example: 'asc',
    }).optional())


    params["project"] = registry.registerParameter('project', z.string().openapi({
        param: {
            name: 'project',
            in: 'query',
        },
        description: "Comma separated list of fields to return from the data property.",
        example: "name,title",
    }).optional())


    params["draft"] = registry.registerParameter('draft', z.string().openapi({
        param: {
            name: 'draft',
            in: 'query',
        },
        description: "Include drafts. Requires a access key with draft access.",
        example: "true",
    }).optional())







    let allRoutes: generateRouteInfoParams[] = [
        ...CONTENT_DOC
    ];


    allRoutes.forEach(r => {
        registry.registerPath(generateRouteDoc(r, params, "/"))
    })

    const generator = new OpenApiGeneratorV3(registry.definitions);

    const doc = generator.generateDocument({
        openapi: '3.0.0',
        info: {
            version: '1.0.0',
            title: 'Frank Content API',
            description: 'This is the Content API, an API that handles retrieving published data from your Frank Space',
        },
        servers: [{ url: '/' }],
    })

    return doc
}