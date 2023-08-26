import { generateRouteInfoParams } from "@/lib/docs"
import { z } from "zod"

export const GET_DOC: generateRouteInfoParams = {
    tags: ["user"],
    path: "/user/token",
    method: "get",
    summary: "Get a token for current user",
    requiresAuth: "user-jwt-token",
    params: [],
    responseSchema: z.object({
        token: z.string(),
    }),
    responseDescription: "User token",
    errors: {

    }

}

export const USER_TOKEN_DOC = [GET_DOC]