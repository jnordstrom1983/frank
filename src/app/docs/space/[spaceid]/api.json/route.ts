import { generateSpaceDocs } from "@/lib/docs"
import { NextResponse } from "next/server"

export function GET(req: Request, context: { params: { spaceid: string } }) {

    let docs = generateSpaceDocs(context.params.spaceid)
    return NextResponse.json(docs)
}