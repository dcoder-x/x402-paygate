import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const text = body.prompt || body.text || "No text provided";

        // Simulate summarization
        const summary = `By reading this: "${text.substring(0, 20)}...", I conclude it is a text about something.`;

        return NextResponse.json({
            summary: summary,
            original_length: text.length
        });
    } catch (e) {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
}
