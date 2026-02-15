import { NextRequest, NextResponse } from "next/server";
import { verifyPayment, createPaymentRequiredResponse } from "@/lib/paygate";
import { X402_HEADERS } from "x402-stacks";

export async function POST(req: NextRequest) {
    try {
        let body: any;
        try {
            // Clone request to avoid "Body is unusable" if read multiple times
            // actually we read it once.
            body = await req.json();
        } catch (e) {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        // Validate required fields
        if (!body.target || !body.price || !body.recipient) {
            return NextResponse.json({
                error: "Missing required fields: target, price, recipient"
            }, { status: 400 });
        }

        const network = body.network || "testnet";
        const sigHeader = req.headers.get(X402_HEADERS.PAYMENT_SIGNATURE);

        // 1. Check for Payment Proof
        if (sigHeader) {
            const verification = await verifyPayment(
                sigHeader,
                parseFloat(body.price),
                body.recipient,
                network
            );

            if (verification.success) {
                // Payment valid -> Proxy request
                // For Proxy Mode, we assume the valid request payload is in body.body
                // or we just forward the request to target.

                const targetUrl = new URL(body.target);
                const headers = new Headers(req.headers);
                headers.delete("host");
                headers.delete(X402_HEADERS.PAYMENT_SIGNATURE);
                headers.delete("content-length");

                const payload = body.body ? JSON.stringify(body.body) : undefined;

                const response = await fetch(targetUrl.toString(), {
                    method: body.method || "POST",
                    headers: headers,
                    body: payload
                });

                // Return proxy response
                // Copy headers from response to NextResponse
                const resHeaders = new Headers(response.headers);

                return new NextResponse(response.body, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: resHeaders
                });

            } else {
                return NextResponse.json({
                    success: false,
                    error: "Payment verification failed",
                    details: verification.error
                }, { status: 402 });
            }
        }

        // 2. No Payment -> Return V2 402 Payment Required
        return createPaymentRequiredResponse(
            parseFloat(body.price),
            body.recipient,
            {
                url: body.target,
                description: "Proxy Request Access"
            },
            network
        );

    } catch (e: any) {
        console.error("PayGate Proxy Error:", e);
        return NextResponse.json({
            success: false,
            error: "Internal Server Error",
            details: e.message
        }, { status: 500 });
    }
}
