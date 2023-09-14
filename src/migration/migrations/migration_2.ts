import { collections } from "@/lib/db";

export async function Migration2(){
    //Add hidden flag on content types
    await collections.contentType.updateMany({ hidden : { $exists : false}}, { $set : { hidden : false}})
    await collections.migration.create({ version : 2, date : new Date()})
}