import { z } from "zod"


export const MigrationSchema = z.object({
    version : z.number(),
    date : z.date(),
})
export type Migration = z.infer<typeof MigrationSchema>
