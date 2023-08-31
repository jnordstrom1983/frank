import { collections } from "@/lib/db";
import { Migration1 } from "./migrations/migration_1";

export async function Migrate(){
    let migrations = await collections.migration.findMany({});
    
    if(!migrations.find(p=>p.version === 1))  await Migration1();
        

}

