import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";

export async function POST(req: NextRequest) {
    try {
        const { requestId, txId } = await req.json();

        if (!requestId || !txId) {
            return NextResponse.json({ error: "Missing requestId or txId" }, { status: 400 });
        }

        const requestData = await storage.get(requestId);

        if (!requestData) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }

        if (requestData.status === "PAID" || requestData.status === "FAILED") {
            return NextResponse.json({ success: false, message: "Request already finalized" });
        }

        // Update status to PENDING and save txId
        await storage.updateStatus(requestId, "PENDING", txId);

        // Ideally, trigger the watcher here if not running, or rely on interval
        // For serverless/dev, ensuring the watcher is active is good practice
        // We'll import it dynamically to avoid side-effects during build time if possible,
        // or just let the singleton pattern handle it.
        const { ensureWatcherRunning } = await import("@/lib/tx-watcher");
        ensureWatcherRunning();

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error attaching tx:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
