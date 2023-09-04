import { generateFrankDocs, generateSpaceDocs } from "@/lib/docs"
import { NextResponse } from "next/server"

export function GET(req: Request, context: { params: { spaceid: string } }) {

    let docs = generateFrankDocs()
    return NextResponse.json(docs)
}