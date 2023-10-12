import { collections } from "@/lib/db";

export async function Migration3(){
    //Add modules to space
    await collections.space.updateMany({ modules : { $exists : false}}, { $set : { modules : []}})
    
    const contentTypes = await collections.contentType.findMany({});
    for(const type of contentTypes){
       const fields = type.fields.map(f=>{
        f.output = true;
        return f
       })
       await collections.contentType.updateOne({ contentTypeId :type.contentTypeId, spaceId : type.spaceId}, { $set : { fields : fields}})
    }

    await collections.migration.create({ version : 3, date : new Date()})
}