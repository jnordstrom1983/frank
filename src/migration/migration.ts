import { collections } from "@/lib/db";
import { Migration1 } from "./migrations/migration_1";
import { Migration2 } from "./migrations/migration_2";

export async function Migrate(){
    let migrations = await collections.migration.findMany({});
    
    if(!migrations.find(p=>p.version === 1))  await Migration1();
    if(!migrations.find(p=>p.version === 2))  await Migration2();
        

}

