import { z } from "zod";


export const UserRoleEnum = z.enum(["admin", "user"]);
export const UserTypeEnum = z.enum(["user", "key"])

export const UserSchema = z.object({
    userId: z.string(),
    email: z.string().email().toLowerCase(),
    role: UserRoleEnum,
    name: z.string(),
    enabled: z.boolean(),
    type : UserTypeEnum,
    lastUsedSpaceId : z.string().optional()
})

export type User = z.infer<typeof UserSchema>
export type UserRole = z.infer<typeof UserRoleEnum>
export type UserType = z.infer<typeof UserTypeEnum>



