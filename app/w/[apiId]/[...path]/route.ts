import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPayment, proxyRequest, createPaymentRequiredResponse } from "@/lib/paygate";
import { X402_HEADERS } from "x402-stacks";

async function handleRequest(
    req: NextRequest,
    props: { params: Promise<{ apiId: string; path: string[] }> }
) {
    const params = await props.params;
    const { apiId, path } = params;

    // 1. Load API Config
    const api = await prisma.aPI.findUnique({
        where: { id: apiId, isActive: true }
    });

    if (!api) {
        return NextResponse.json({ error: "API not found or inactive" }, { status: 404 });
    }

    // 2. Check for Payment Proof (V2 Header)
    const sigHeader = req.headers.get(X402_HEADERS.PAYMENT_SIGNATURE);

    if (sigHeader) {
        // Verify payment (V2: Verify & Settle)
        const verification = await verifyPayment(
            sigHeader,
            api.pricePerRequest,
            api.stacksAddress,
            api.network as "mainnet" | "testnet",
            api.id
        );

        if (verification.success) {
            // Payment valid -> Proxy request
            // Construct target URL: api.originalUrl + path
            // Ensure no double slashes
            const baseUrl = api.originalUrl.endsWith("/") ? api.originalUrl.slice(0, -1) : api.originalUrl;
            const pathSuffix = path.join("/");
            const fullTargetUrl = `${baseUrl}/${pathSuffix}`;

            return proxyRequest(fullTargetUrl, req, api.id);
        } else {
            // Payment invalid
            return NextResponse.json({
                success: false,
                error: "Payment verification failed",
                details: verification.error
            }, { status: 402 });
        }
    }

    // 3. No Payment -> Return V2 402 Payment Required
    // Using helper to generate standard V2 response
    return createPaymentRequiredResponse(
        api.pricePerRequest,
        api.stacksAddress,
        {
            url: req.url,
            description: `Access to ${api.name}`
        },
        api.network as "mainnet" | "testnet"
    );
}

// Export handlers for all common methods
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const DELETE = handleRequest;
export const PATCH = handleRequest;
export const HEAD = handleRequest;
export const OPTIONS = handleRequest;
