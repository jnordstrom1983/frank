import { collections } from "@/lib/db";

export async function Migration6(){

    
    await collections.spaceUser.updateMany({ tags : { $exists : false}}, { $set : { tags : []}})

    await collections.migration.create({ version : 6, date : new Date()})
}