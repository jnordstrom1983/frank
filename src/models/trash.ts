import { z } from "zod";
import { ContentDataSchema } from "./contentdata";
import { SpaceLanguageEnum } from "./space";
import { ContentSchema } from "./content";


export const TrashItemSchema = ContentSchema.extend({
    deletedUserId : z.string(),
    deleted : z.date(),
    datas : z.array(ContentDataSchema)
})
export type TrashItem = z.infer<typeof TrashItemSchema>