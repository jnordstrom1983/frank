import { generateRouteInfoParams } from "@/lib/docs"
import { z } from "zod"



const POST_DOC: generateRouteInfoParams = {
    tags: ["login"],
    path: "/user/login",
    method: "post",
    summary: "Login to Charlee",
    requiresAuth: "none",
    params: [],
    requestSchema: z.object({
        email: z.string().email().toLowerCase(),
    }),
    responseSchema: z.object({
        token: z.string(),
    }),
    responseDescription: "Verification code sent",
    errors: {}

}

export const USER_LOGIN_DOC = [POST_DOC]