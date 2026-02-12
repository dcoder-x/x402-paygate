interface StacksTx {
    tx_status: string;
    tx_id: string;
    sender_address: string;
    tx_type: string;
    token_transfer?: {
        recipient_address: string;
        amount: string;
        memo?: string;
    };
}

export async function verifyTransaction(
    txId: string,
    requiredAmount: string,
    requiredRecipient: string,
    requiredAsset: "STX"
): Promise<{ success: boolean; error?: string }> {
    try {
        // 1. Fetch transaction from Stacks node with retry logic
        // Using testnet by default
        const maxRetries = 3;
        let response: Response | null = null;
        let lastError: string = "";

        for (let i = 0; i < maxRetries; i++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);

                try {
                    response = await fetch(
                        `https://stacks-node-api.testnet.stacks.co/extended/v1/tx/${txId}`,
                        { signal: controller.signal }
                    );
                } finally {
                    clearTimeout(timeoutId);
                }

                if (response.ok) break;

                // If 404, might be propagation delay, retry
                if (response.status === 404) {
                    await new Promise(r => setTimeout(r, 2000));
                    continue;
                }

                throw new Error(`Status ${response.status}`);
            } catch (err) {
                lastError = `Attempt ${i + 1} failed`;
                if (i < maxRetries - 1) {
                    await new Promise(r => setTimeout(r, 1000 * (i + 1)));
                }
            }
        }

        if (!response || !response.ok) {
            // If 404 after retries, it's likely not propagated yet or invalid ID
            // We return error but watcher will keep retrying until it appears or we timeout logic (handled by watcher eventually or manual expiry)
            return { success: false, error: "Transaction not found or network error." };
        }

        const txData: StacksTx = await response.json();

        // 2. Verify status
        if (txData.tx_status === "pending") {
            return { success: false, error: "Transaction is still pending." };
        }

        if (txData.tx_status !== "success") {
            return { success: false, error: `Transaction failed with status: ${txData.tx_status}` };
        }

        // 3. Verify recipient
        if (txData.tx_type !== "token_transfer") {
            return { success: false, error: "Transaction is not a token transfer." };
        }

        if (!txData.token_transfer) {
            return { success: false, error: "Token transfer data not found." };
        }

        if (txData.token_transfer.recipient_address !== requiredRecipient) {
            return { success: false, error: `Invalid recipient address: ${txData.token_transfer.recipient_address}` };
        }

        // 4. Verify amount
        // Stacks amounts are in micro-STX (uSTX). 1 STX = 1,000,000 uSTX.
        const requiredMicroStx = BigInt(Math.floor(parseFloat(requiredAmount) * 1_000_000));
        const txAmountMicroStx = BigInt(txData.token_transfer.amount);

        if (txAmountMicroStx < requiredMicroStx) {
            return { success: false, error: `Insufficient amount. Expected ${requiredMicroStx}, got ${txAmountMicroStx}` };
        }

        return { success: true };

    } catch (error) {
        console.error("[v0] Verification error:", error);
        return { success: false, error: "Verification error. Please try again." };
    }
}
