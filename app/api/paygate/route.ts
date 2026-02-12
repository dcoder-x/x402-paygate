import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { replayProtection } from "@/lib/replay";
import { forwardRequest } from "@/lib/proxy";
import { PayGateRequest, PaymentRequest } from "@/lib/types";

export async function POST(req: NextRequest) {
    try {
        const body: PayGateRequest = await req.json();
        const requestIdHeader = req.headers.get("X-X402-RequestId");
        const domain = req.headers.get("host") || "localhost:3000";
        const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
        const baseUrl = `${protocol}://${domain}`;

        // Validate required fields
        if (!body.price || !body.recipient || !body.asset) {
            return NextResponse.json({
                error: "Missing required fields: price, recipient, asset"
            }, { status: 400 });
        }

        // 1. New Request (No Header)
        if (!requestIdHeader) {
            const requestId = "req_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);

            const paymentRequest: PaymentRequest = {
                ...body,
                requestId,
                status: "IDLE",
                createdAt: Date.now(),
                successUrl: body.successUrl,
                cancelUrl: body.cancelUrl
            };

            await storage.create(requestId, paymentRequest);

            return NextResponse.json({
                error: "Payment Required",
                code: "X402_PAYMENT_REQUIRED",
                payment: {
                    requestId,
                    checkoutUrl: `${baseUrl}/checkout/${requestId}`,
                    network: "stacks-testnet",
                    asset: "STX",
                    amount: body.price,
                    recipient: body.recipient,
                    expiresAt: Date.now() + 3600000 // 1 hour
                }
            }, { status: 402 });
        }

        // 2. Existing Request (With Header)
        const requestId = requestIdHeader;
        const requestData = await storage.get(requestId);

        if (!requestData) {
            return NextResponse.json({ error: "Invalid Request ID" }, { status: 400 });
        }

        if (requestData.status !== "PAID" && requestData.status !== "COMPLETED") {
            return NextResponse.json({ error: "Payment not confirmed" }, { status: 402 });
        }

        // Replay Protection (Request Level)
        if (requestData.status === "COMPLETED") {
            // Optional: Allow replay if idempotent? For now, strict 1-time use as per plan.
            return NextResponse.json({ error: "Request already consumed" }, { status: 409 });
        }

        // Replay Protection (Tx Level) - Double check
        if (requestData.txId && replayProtection.has(requestData.txId)) {
            // Technically this should have been caught at verification time, but good to be safe
        }
        if (requestData.txId) replayProtection.add(requestData.txId);

        // Forward
        const result = await forwardRequest(
            requestData.target,
            requestData.method,
            requestData.headers,
            requestData.body // Use stored body
        );

        // Mark as consumed
        await storage.updateStatus(requestId, "COMPLETED");

        return NextResponse.json({
            status: "success",
            forwarded: true,
            data: result
        });

    } catch (e: any) {
        console.error("PayGate Error:", e);
        return NextResponse.json({
            error: "Internal Server Error",
            details: e.message
        }, { status: 500 });
    }
}
