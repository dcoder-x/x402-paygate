import { verifyTransaction } from "./payment";
import prisma from "./prisma";
import {
    X402PaymentVerifier,
    PaymentRequiredV2,
    PaymentPayloadV2,
    X402_HEADERS,
    STXtoMicroSTX
} from "x402-stacks";

/**
 * Generates a V2-compliant 402 Payment Required response.
 */
export function createPaymentRequiredResponse(
    priceStx: number,
    recipient: string,
    resource: { url: string; description?: string },
    network: "mainnet" | "testnet" = "testnet"
) {
    const paymentRequired: PaymentRequiredV2 = {
        x402Version: 2,
        resource: {
            url: resource.url,
            description: resource.description || "Premium API Resource",
            mimeType: "application/json"
        },
        accepts: [
            {
                scheme: "item-price",
                network: `stacks:${network}`,
                amount: STXtoMicroSTX(priceStx.toString()).toString(),
                asset: "STX",
                payTo: recipient,
                maxTimeoutSeconds: 3600 // 1 hour validity
            }
        ]
    };

    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set(X402_HEADERS.PAYMENT_REQUIRED, btoa(JSON.stringify(paymentRequired)));

    return new Response(JSON.stringify(paymentRequired), {
        status: 402,
        headers
    });
}

/**
 * Verifies a V2 payment signature header.
 */


/**
 * Verifies a V2 payment signature header.
 */
export async function verifyPayment(
    paymentSignatureHeader: string,
    priceStx: number,
    recipient: string,
    network: "mainnet" | "testnet" = "testnet",
    apiId?: string
) {
    try {
        // 1. Decode Header
        const jsonString = atob(paymentSignatureHeader);
        const payload: PaymentPayloadV2 = JSON.parse(jsonString);
        const txOrBlob = payload.payload.transaction;

        let senderAddress = "";
        let txId = "";

        // CHECK: Is this a simple TxID (standard wallet) or a signed blob (x402 facilitator)?
        const isTxId = typeof txOrBlob === "string" && txOrBlob.startsWith("0x") && txOrBlob.length === 66;
        const isMock = typeof txOrBlob === "string" && txOrBlob.startsWith("0xMOCK_DEMO_");

        if (isTxId || isMock) {
            // --- SCENARIO A: Transaction ID (Standard Wallet or Mock) ---
            txId = txOrBlob;

            const verification = await verifyTransaction(
                txId,
                priceStx.toString(),
                recipient,
                "STX"
            );

            if (!verification.success) {
                return { success: false, error: verification.error };
            }

            senderAddress = verification.sender || "unknown";

        } else {
            // --- SCENARIO B: Signed Blob (x402 V2 Facilitator) ---
            // 2. Initialize Verifier
            // In V2, the config is passed during verify/settle
            const verifier = new X402PaymentVerifier();

            const paymentRequirements = {
                scheme: "item-price",
                network: `stacks:${network}` as any,
                amount: STXtoMicroSTX(priceStx.toString()).toString(),
                asset: "STX",
                payTo: recipient,
                maxTimeoutSeconds: 3600
            };

            // 3. Verify Signature
            const verification = await verifier.verify(payload, { paymentRequirements });

            if (!verification.isValid) {
                return { success: false, error: verification.invalidReason };
            }

            // 4. Settle / Broadcast
            const settlement = await verifier.settle(payload, { paymentRequirements });

            if (!settlement.success) {
                return { success: false, error: settlement.errorReason };
            }

            txId = settlement.transaction;
            senderAddress = settlement.payer || "unknown";
        }

        // --- COMMON: Replay Protection & Recording ---

        // Check Replay in DB using the actual TxID
        const existingPayment = await prisma.payment.findUnique({
            where: { txHash: txId }
        });

        if (existingPayment) {
            return { success: false, error: "Payment already used (Replay Detected)" };
        }

        // 5. Record Payment
        await prisma.payment.create({
            data: {
                apiId: apiId || undefined,
                txHash: txId,
                amount: priceStx,
                payerAddress: senderAddress,
            }
        }).catch(e => console.error("DB Error recording payment:", e));

        return { success: true, sender: senderAddress };

    } catch (e: any) {
        console.error("Verification Error:", e);
        return { success: false, error: e.message };
    }
}

export async function proxyRequest(
    targetUrlString: string,
    req: Request,
    apiId?: string
) {
    const targetUrl = new URL(targetUrlString);

    // Copy search params
    const incomingUrl = new URL(req.url);
    incomingUrl.searchParams.forEach((value, key) => {
        targetUrl.searchParams.append(key, value);
    });

    // Prepare headers (exclude host, etc)
    const headers = new Headers(req.headers);
    headers.delete("host");
    headers.delete("x-402-tx-id");
    headers.delete(X402_HEADERS.PAYMENT_SIGNATURE); // V2 Header
    headers.delete("authorization");
    headers.delete("content-length");

    try {
        const start = Date.now();
        const hasBody = req.method !== "GET" && req.method !== "HEAD";
        const body = hasBody ? await req.blob() : undefined;

        const fetchOptions: RequestInit = {
            method: req.method,
            headers: headers,
            body: body,
        };

        if (hasBody) {
            // @ts-ignore
            fetchOptions.duplex = "half";
        }

        const response = await fetch(targetUrl.toString(), fetchOptions);
        const duration = Date.now() - start;

        // Log the request if associated with an API
        if (apiId) {
            await prisma.aPIRequest.create({
                data: {
                    apiId: apiId,
                    success: response.ok,
                    responseMs: duration
                }
            }).catch(e => console.error("Failed to log request:", e));
        }

        return response;
    } catch (error) {
        console.error("Proxy error:", error);
        return new Response("Proxy Error: " + (error as Error).message, { status: 502 });
    }
}
