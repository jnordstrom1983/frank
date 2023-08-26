import { z } from "zod";


export const SpaceUserRoleEnum = z.enum(["owner", "editor"]);

export const SpaceUserSchema = z.object({
    userId: z.string(),
    spaceId: z.string(),
    role: SpaceUserRoleEnum

})

export type SpaceUser = z.infer<typeof SpaceUserSchema>

export type SpaceUserRole = z.infer<typeof SpaceUserRoleEnum>



