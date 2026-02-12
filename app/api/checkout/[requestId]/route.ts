import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ requestId: string }> }
) {
    const { requestId } = await params;
    const requestData = await storage.get(requestId);

    if (!requestData) {
        return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json({
        requestId: requestData.requestId,
        price: requestData.price,
        asset: requestData.asset,
        recipient: requestData.recipient,
        target: requestData.target,
        status: requestData.status,
        createdAt: requestData.createdAt,
        successUrl: requestData.successUrl,
        cancelUrl: requestData.cancelUrl
    });
}
