import { returnJSON } from "@/lib/apiUtils";
import { processTryingEvents } from "@/lib/webhook";
import { z } from "zod";

export async function GET(req: Request, context: { params: { spaceid: string } }) {
    await processTryingEvents()    
    return returnJSON({},z.object({}))
}