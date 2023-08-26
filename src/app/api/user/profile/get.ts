import { returnJSON, returnNotFound, withRequestBody, withUser } from "@/lib/apiUtils"
import { Permissions, dbCollection } from "@/lib/constants"
import { z } from "zod"
import clientPromise from "@/lib/mongodb"
import { User, UserRoleEnum } from "@/models/user"
import { WithId } from "mongodb"
import { jwtType, sign } from "@/lib/jwt"
import { v4 as uuidv4 } from "uuid"
import { collections } from "@/lib/db"
import { generateRouteInfoParams } from "@/lib/docs"

const responseSchema = z.object({
    token: z.string(),
    email: z.string(),
    name: z.string(),
    role: UserRoleEnum,
    lastUsedSpaceId : z.string().optional()
})

export type UserProfileGetResponse = z.infer<typeof responseSchema>

export async function GET(req: Request) {
    return await withUser(req, "any", async (user) => {
        const token = sign(jwtType.authToken, { userId: user.userId }, { expiresIn: process.env.JWT_AUTHTOKEN_EXPIRES_IN })

        return returnJSON<z.infer<typeof responseSchema>>({ token, email: user.email, name: user.name, role: user.role, lastUsedSpaceId : user.lastUsedSpaceId }, responseSchema)
    })
}


export const GET_DOC: generateRouteInfoParams = {
    tags: ["user"],
    path: "/user/profile",
    method: "get",
    summary: "Get current user profile",
    requiresAuth: "user-jwt-token",
    params: [],
    responseSchema: responseSchema,
    responseDescription: "User profile",
    errors: {

    }

}