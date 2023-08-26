import { SignOptions, sign as jsonSign, verify as jsonVerify } from "jsonwebtoken"

export enum jwtType {
    login,
    authToken
}

export interface jwtSignOptions extends SignOptions{
    signingKey? : string
}

export function sign(type: jwtType, data: any,  options?: jwtSignOptions) {
    const { signingKey, ...jwtOptions}  = options || {};
    return jsonSign(
        {
            type,
            data,
        },
        options?.signingKey || process.env.JWT_SIGNINGKEY!,
        jwtOptions
    )
}

export function verify(token: string, type: jwtType, signingKey? : string) {
    try {
        const payload = jsonVerify(token, signingKey || process.env.JWT_SIGNINGKEY!) as any
        if (payload.type != type) {
            return undefined
        }
        return payload.data
    } catch {
        return undefined
    }
}
