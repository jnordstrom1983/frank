import { errorCodes } from "@/lib/constants"
import { generateRouteInfoParams } from "@/lib/docs"
import { z } from "zod"



const POST_DOC: generateRouteInfoParams = {
    tags: ["login"],
    path: "/user/verify",
    method: "post",
    summary: "Verify login to Frank",
    requiresAuth: "none",
    params: [],
    requestSchema: z.object({
        token: z.string(),
        code: z.string(),
    }),
    responseSchema: z.object({
        token: z.string(),
    }),
    responseDescription: "Successfully verified user login token",
    errors: {
        ERROR_NOTFOUND: "User not found",
        CUSTOM: [
            {
                statusCode: 400, description: "Invalid token", schema: z.object({
                    code: z.literal(errorCodes.invalidCodeOrToken),
                    message: z.literal("Invalid token"),

                })
            }
        ]

    }

}

export const USER_VERIFY_DOC = [POST_DOC]