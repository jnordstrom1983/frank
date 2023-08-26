import { returnJSON, returnNotFound, withRequestBody, withUser } from "@/lib/apiUtils"
import { Permissions, dbCollection } from "@/lib/constants"
import { z } from "zod"
import clientPromise from "@/lib/mongodb"
import { User } from "@/models/user"
import { WithId } from "mongodb"
import { jwtType, sign } from "@/lib/jwt"
import { v4 as uuidv4 } from "uuid"
import { collections } from "@/lib/db"
import { sendEmailSignin } from "@/lib/mail"


const requestSchema = z.object({
    email: z.string().email().toLowerCase(),
})
const responseSchema = z.object({
    token: z.string(),
})



export type UserLoginPostResponse = z.infer<typeof responseSchema>


export async function POST(req: Request) {


    return await withRequestBody(req, requestSchema, async (data) => {
        const client = await clientPromise

        const user = await collections.user.findOne({ email: data.email, enabled: true })
        const userId = user ? user.userId : uuidv4()
        const code = Math.floor(Math.random() * 89999999 + 10000000)

        const token = sign(jwtType.login, { userId }, { expiresIn: process.env.JWT_LOGIN_EXPIRES_IN, signingKey: code.toString() })

        if (!user) {
            return returnJSON({ token }, responseSchema)
        }
        try {
            await sendEmailSignin(code, token, user.email);
        } catch (ex) {
            console.log(ex)
        }
        console.log("token", token)
        console.log("code", code)

        return returnJSON<z.infer<typeof responseSchema>>({ token }, responseSchema)
    })

}
