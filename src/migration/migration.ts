import { collections } from "@/lib/db";
import { Migration1 } from "./migrations/migration_1";
import { Migration2 } from "./migrations/migration_2";
import { Migration3 } from "./migrations/migration_3";
import { Migration4 } from "./migrations/migration_4";
import { Migration5 } from "./migrations/migration_5";
import { Migration6 } from "./migrations/migration_6";
import { Migration7 } from "./migrations/migration_7";

export async function Migrate(){
    let migrations = await collections.migration.findMany({});
    if(!migrations.find(p=>p.version === 1))  await Migration1();
    if(!migrations.find(p=>p.version === 2))  await Migration2();
    if(!migrations.find(p=>p.version === 3))  await Migration3();
    if(!migrations.find(p=>p.version === 4))  await Migration4();
    if(!migrations.find(p=>p.version === 5))  await Migration5();
    if(!migrations.find(p=>p.version === 6))  await Migration6();
    if(!migrations.find(p=>p.version === 7))  await Migration7();
        

}

