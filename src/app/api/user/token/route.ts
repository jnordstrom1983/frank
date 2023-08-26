import { returnError, returnJSON, returnNotFound, withRequestBody, withUser } from "@/lib/apiUtils"
import { Permissions, dbCollection, errorCodes } from "@/lib/constants"
import { z } from "zod"
import clientPromise from "@/lib/mongodb"
import { User } from "@/models/user"
import { WithId } from "mongodb"
import { jwtType, sign, verify } from "@/lib/jwt"
import { v4 as uuidv4 } from "uuid"

export async function GET(req: Request) {
    const responseSchema = z.object({
        token: z.string(),
    })

    return await withUser(req, "any", async (user) => {
        const token = sign(jwtType.authToken, { userId: user.userId }, { expiresIn: process.env.JWT_AUTHTOKEN_EXPIRES_IN })
        return returnJSON<z.infer<typeof responseSchema>> ({ token }, responseSchema)
    })
}
