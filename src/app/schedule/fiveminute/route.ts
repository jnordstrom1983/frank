import { returnJSON } from "@/lib/apiUtils";
import { collections } from "@/lib/db";
import { processTryingEvents } from "@/lib/webhook";
import dayjs from "dayjs";
import { z } from "zod";

export async function GET(req: Request, context: { params: { spaceid: string } }) {
    await processTryingEvents()  
    
    await collections.content.deleteMany({
        status : "new",
        createdDate : {
            $lt : dayjs(new Date()).add(1, "day").toDate()
        }
    })
    

    return returnJSON({},z.object({}))
}