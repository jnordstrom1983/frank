import { User, UserRole, UserRoleEnum } from "@/models/user"
import { NextResponse } from "next/server"
import { Schema, z, ZodType } from "zod"
import { dbCollection, errorCodes, Permissions } from "./constants"
import clientPromise from "./mongodb"
import { jwtType, verify } from "./jwt"
import { SpaceUser, SpaceUserRole } from "@/models/spaceuser"
import { collections } from "./db"

export async function withRequestBody<Schema extends ZodType>(req: Request, schema: Schema, callback: (data: z.infer<Schema>) => Promise<NextResponse>): Promise<NextResponse> {
    const body = await req.json()
    const result = schema.safeParse(body)
    if (result.success) {
        return await callback(result.data)
    } else {
        return returnError({ error: result.error, code: errorCodes.invalidRequestBody, message: "Request body did not validate", status: 422 })
    }
}

export async function withContentAccess(req: Request, spaceId: string, callback: (contentTypes?: string[], drafts? : boolean) => Promise<NextResponse>): Promise<NextResponse> {

    const space = await collections.space.findOne({ spaceId: spaceId });
    if (!space) {
        return returnNotFound("Space not found")
    }

    const [_, token] = (req.headers.get("authorization") || "").trim().split(" ")
    if (space.contentAccess !== "open" && !token) {
        return returnError({ code: errorCodes.unauthorized, message: "No access key specified" })
    }

    if (space.contentAccess === "open" && !token) {
        return await callback()
    }

    const key = await collections.accessKey.findOne({ spaceId, key: token });
    
    if (!key) {
        return returnError({ code: errorCodes.unauthorized, message: "Access key not found" })
    }
    if (key.allContent) {
        return await callback(undefined, key.drafts)
    } else {
        return await callback(key.contentTypes, key.drafts)

    }

}

export async function withUser(req: Request, role: UserRole | "any", callback: (user: User) => Promise<NextResponse>): Promise<NextResponse> {
    let [_, token] = (req.headers.get("authorization") || "").trim().split(" ")
    if (!token) {
        const urlParams = new URLSearchParams(req.url.split("?").pop());
        token = urlParams.get('token') || "";
    }

    if (!token) {
        return returnError({ code: errorCodes.unauthorized, message: "No authorization token specified" })
    }
    const tokenData = verify(token, jwtType.authToken) as { userId: string }
    if (!tokenData) {
        return returnError({ code: errorCodes.unauthorized, message: "Invalid/expired token" })
    }

    const client = await clientPromise
    const user = await client.db().collection(dbCollection.user).findOne<User>({ userId: tokenData.userId })

    if (!user) {
        return returnError({ code: errorCodes.unauthorized, message: "User not found" })
    }

    return await callback(user)
}

export async function withSpaceRole(user: User, spaceId: string, requiredRole: SpaceUserRole | "any", callback: (role: SpaceUserRole) => Promise<NextResponse>): Promise<NextResponse> {
    if(user.role === "admin") return await callback("owner");
    const spaceUser = await collections.spaceUser.findOne({ spaceId, userId: user.userId })
    if (!spaceUser) {
        
        return returnError({ code: errorCodes.forbidden, message: "Access denied" })
    }
    if (requiredRole !== "any") {
        if (requiredRole !== spaceUser.role) {
            return returnError({ code: errorCodes.forbidden, message: "Access denied (invalid role)" })
        }
    }
    return await callback(spaceUser.role)

}

export function returnJSON<T>(data: T, schema: Schema) {
    const result = schema.safeParse(data)
    if (result.success) {
        return NextResponse.json(data)
    } else {
        return returnError({ error: result.error, code: errorCodes.invalidResponseData, message: "Response data did not validate" })
    }
}

export function returnNotFound(message: string) {
    return returnError({ error: "Not found", message: message, code: 404, status: 404 })
}

export function returnConflict(message: string) {
    return returnError({ error: "Conflict", message: message, code: 409, status: 409 })
}

export function returnInvalidData(message: string) {
    return returnError({ error: "Invalid input", message: message, code: 422, status: 422 })
}

export const errorResponseSchema = z.object({
    code: z.number(),
    message: z.string().optional(),
    error: z.any().optional(),
})
export type errorResponse = z.infer<typeof errorResponseSchema>

export function returnError({ error, code = errorCodes.unknown, message = "Unknown error", status = 400 }: { error?: any; code?: number; message?: string; status?: number }) {
    const response: errorResponse = {
        error,
        code,
        message,
    }
    return NextResponse.json(response, { status })
}
