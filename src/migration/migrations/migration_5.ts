import { collections } from "@/lib/db";

export async function Migration5(){

    //Add index to contentData
    (await collections.contentData.collection()).createIndex({ contentId : 1}, { name : "contentId"})

    await collections.migration.create({ version : 5, date : new Date()})
}