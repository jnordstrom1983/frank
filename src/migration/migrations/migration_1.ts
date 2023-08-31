import { collections } from "@/lib/db";

export async function Migration1(){
    //Add drafts to accesss keys
    await collections.accessKey.updateMany({ drafts : { $exists : false}}, { $set : { drafts : false}})
    await collections.migration.create({ version : 1, date : new Date()})
}