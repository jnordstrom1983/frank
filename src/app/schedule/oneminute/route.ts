import { FindContenToDepublish, FindContenToPublish } from "@/app/api/space/[spaceid]/content/[contentid]/put";
import { returnJSON } from "@/lib/apiUtils";
import { z } from "zod";
export const dynamic = 'force-dynamic'

export async function GET(req: Request, context: { params: { spaceid: string } }) {


    await FindContenToPublish()
    await FindContenToDepublish() 

    return returnJSON({},z.object({}))



}