import { returnError, returnJSON, returnNotFound, withRequestBody, withUser } from "@/lib/apiUtils"
import { Permissions, dbCollection, errorCodes } from "@/lib/constants"
import { z } from "zod"
import clientPromise from "@/lib/mongodb"
import { User } from "@/models/user"
import { WithId } from "mongodb"
import { jwtType, sign, verify } from "@/lib/jwt"
import { v4 as uuidv4 } from "uuid"
import { collections } from "@/lib/db"
import { Migrate } from "@/migration/migration"

const requestSchema = z.object({
    token: z.string(),
    code: z.string(),
})
const responseSchema = z.object({
    token: z.string(),
})

export type UserVerifyPostResponse = z.infer<typeof responseSchema>

export async function POST(req: Request) {


    return await withRequestBody(req, requestSchema, async (data) => {
        const tokenData = verify(data.token, jwtType.login, data.code) as { userId: string }
        if (!tokenData) {
            return returnError({ code: errorCodes.invalidCodeOrToken, message: "Token or code does not match" })
        }

        const client = await clientPromise
        const user = await collections.user.findOne({ userId : tokenData.userId })
        if (!user) {
            return returnNotFound("User not found")
        }

        const token = sign(jwtType.authToken, { userId: user.userId }, { expiresIn: process.env.JWT_AUTHTOKEN_EXPIRES_IN })

        //Perform data migration
        await Migrate()

        return returnJSON<z.infer<typeof responseSchema>>({ token }, responseSchema)
    })
}
