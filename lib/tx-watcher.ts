import prisma from "./prisma";
import { verifyTransaction } from "./payment";

let watcherInterval: NodeJS.Timeout | null = null;
const POLL_INTERVAL = 10000; // 10 seconds

export function ensureWatcherRunning() {
    if (watcherInterval) return;

    console.log("[TxWatcher] Starting background verification service...");
    watcherInterval = setInterval(checkPendingPayments, POLL_INTERVAL);

    // Initial check immediately
    checkPendingPayments();
}

async function checkPendingPayments() {
    try {
        // Find all PENDING requests with a txId
        const pendingRequests = await prisma.paymentRequest.findMany({
            where: {
                status: "PENDING",
                txId: { not: null }
            }
        });

        if (pendingRequests.length === 0) return;

        console.log(`[TxWatcher] Checking ${pendingRequests.length} pending transactions...`);

        for (const req of pendingRequests) {
            if (!req.txId) continue;

            const verification = await verifyTransaction(
                req.txId,
                req.price,
                req.recipient,
                req.asset as "STX"
            );

            if (verification.success) {
                console.log(`[TxWatcher] Payment verified for ${req.requestId}`);
                await prisma.paymentRequest.update({
                    where: { id: req.id },
                    data: { status: "PAID" }
                });
            } else if (verification.error && verification.error.includes("failed")) {
                // Only mark as FAILED if explicitly failed, not just pending
                console.log(`[TxWatcher] Payment failed for ${req.requestId}: ${verification.error}`);
                await prisma.paymentRequest.update({
                    where: { id: req.id },
                    data: { status: "FAILED" }
                });
            }
            // If just pending/not found yet, leave as PENDING
        }
    } catch (error) {
        console.error("[TxWatcher] Error in checkPendingPayments:", error);
    }
}
