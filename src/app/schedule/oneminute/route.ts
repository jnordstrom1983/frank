import { returnJSON } from "@/lib/apiUtils";
import { z } from "zod";

export async function GET(req: Request, context: { params: { spaceid: string } }) {
    return returnJSON({},z.object({}))

}