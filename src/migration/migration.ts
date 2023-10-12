import { collections } from "@/lib/db";
import { Migration1 } from "./migrations/migration_1";
import { Migration2 } from "./migrations/migration_2";
import { Migration3 } from "./migrations/migration_3";

export async function Migrate(){
    let migrations = await collections.migration.findMany({});
    
    if(!migrations.find(p=>p.version === 1))  await Migration1();
    if(!migrations.find(p=>p.version === 2))  await Migration2();
    if(!migrations.find(p=>p.version === 3))  await Migration3();
        

}

