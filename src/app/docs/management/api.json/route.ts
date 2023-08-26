import { generateCharleeDocs, generateSpaceDocs } from "@/lib/docs"
import { NextResponse } from "next/server"

export function GET(req: Request, context: { params: { spaceid: string } }) {

    let docs = generateCharleeDocs()
    return NextResponse.json(docs)
}