import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { verifyTransaction } from "@/lib/payment";

export async function POST(req: NextRequest) {
    try {
        const { requestId, txId } = await req.json();
        const requestData = await storage.get(requestId);

        if (!requestData) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }

        if (requestData.status === "PAID" || requestData.status === "COMPLETED") {
            return NextResponse.json({ success: true, message: "Already paid" });
        }

        // Verify
        const verification = await verifyTransaction(
            txId,
            requestData.price,
            requestData.recipient,
            requestData.asset
        );

        if (!verification.success) {
            return NextResponse.json({
                success: false,
                error: verification.error
            }, { status: 400 });
        }

        // Update Storage
        await storage.updateStatus(requestId, "PAID", txId);

        return NextResponse.json({ success: true });

    } catch (e: any) {
        console.error("Verification API Error:", e);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
