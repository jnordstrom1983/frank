import { generateCharleeDocs, generateContentDocs, generateSpaceDocs } from "@/lib/docs"
import { NextResponse } from "next/server"

export function GET(req: Request, context: { params: { spaceid: string } }) {

    let docs = generateContentDocs(context.params.spaceid)
    return NextResponse.json(docs)
}