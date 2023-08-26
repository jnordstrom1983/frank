import { returnError, returnJSON, returnNotFound, withRequestBody, withUser } from "@/lib/apiUtils"
import { Permissions, dbCollection, errorCodes } from "@/lib/constants"
import { z } from "zod"
import clientPromise from "@/lib/mongodb"
import { User, UserSchema } from "@/models/user"
import { WithId } from "mongodb"
import { jwtType, sign, verify } from "@/lib/jwt"
import { v4 as uuidv4 } from "uuid"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"

export const GetUserResponseSchema = z.object({
    users: z.array(UserSchema),
})

export type GetUserResponse = z.infer<typeof GetUserResponseSchema>

export async function GET(req: Request) {
    return await withUser(req, "admin", async (user) => {
        const users = (await collections.user.findMany({ type: "user" })).sort((u1, u2) => {
            if (u1.email > u2.email) return 1;
            if (u1.email < u2.email) return -1;
            return 0;
        })

        return returnJSON<GetUserResponse>({ users }, GetUserResponseSchema)
    })
}


export const GET_DOC: generateRouteInfoParams = {
    tags: ["user"],
    path: "/user",
    method: "get",
    summary: "List all Charlee users",
    requiresAuth: "user-jwt-token",
    params: [],
    responseSchema: GetUserResponseSchema,
    responseDescription: "List of users",
    errors: {}
}