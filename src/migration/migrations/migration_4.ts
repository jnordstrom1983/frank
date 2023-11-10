import { collections } from "@/lib/db";

export async function Migration4(){
    //Add links to space
    await collections.space.updateMany({ links : { $exists : false}}, { $set : { links : []}})

    //Add features to space
    await collections.space.updateMany({ userFeatures : { $exists : false}}, { $set : { userFeatures : ["asset", "content"]}})

    await collections.migration.create({ version : 4, date : new Date()})
}