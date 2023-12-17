import { collections } from "@/lib/db";

export async function Migration7(){

    //Add index to assets
    (await collections.asset.collection()).createIndex({ assetId : 1}, { name : "assetId"})

    await collections.migration.create({ version : 7, date : new Date()})
}