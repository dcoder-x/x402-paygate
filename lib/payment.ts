import {
    isValidStacksAddress,
    STXtoMicroSTX
} from "x402-stacks";

interface StacksTx {
    tx_status: string;
    tx_id: string;
    sender_address: string;
    tx_type: string;
    block_height?: number;
    burn_block_time?: number;
    token_transfer?: {
        recipient_address: string;
        amount: string;
        memo?: string;
    };
}

const STACKS_API_URL = "https://api.testnet.hiro.so"; // Hardcoded for hackathon stability, or use env

export async function verifyTransaction(
    txId: string,
    requiredAmount: string, // in STX
    requiredRecipient: string,
    requiredAsset: "STX",
    requiredMemo?: string
): Promise<{ success: boolean; error?: string; retryable?: boolean; sender?: string }> {

    // 🕵️‍♂️ DEMO MODE BYPASS: Allow mock transactions for presentation
    if (txId.startsWith("0xMOCK_DEMO_")) {
        console.log("⚠️ DEMO MODE: Bypassing verification for mock transaction.");
        return { success: true, sender: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM" };
    }

    // 0️⃣ Pre-validation using x402-stacks
    if (!isValidStacksAddress(requiredRecipient)) {
        return { success: false, error: "Invalid recipient address config." };
    }

    try {
        const response = await fetch(
            `${STACKS_API_URL}/extended/v1/tx/${txId}`,
            {
                signal: AbortSignal.timeout(5000) // 5s timeout
            }
        );

        if (response.status === 404) {
            return { success: false, error: "Transaction not found on chain yet.", retryable: true };
        }

        if (!response.ok) {
            const text = await response.text();
            return { success: false, error: `Stacks API Error: ${response.status} ${text}`, retryable: true };
        }

        const txData: StacksTx = await response.json();

        // 1️⃣ Must be successful
        if (txData.tx_status === "pending") {
            return { success: false, error: "Transaction is still pending.", retryable: true };
        }

        if (txData.tx_status !== "success") {
            return { success: false, error: `Transaction failed with status: ${txData.tx_status}` };
        }

        // 2️⃣ Must be confirmed in a block (Microblock is okay for speed, but ideally anchor block)
        // For PayGate speed, we accept microblocks (no block_height check if strictness not required)
        // But for safety, let's keep block check OR allow unanchored if status is success.
        // Stacks API 'success' usually implies inclusion or microblock confirmation.
        // Let's rely on tx_status === "success".

        // 3️⃣ Must be token transfer
        if (txData.tx_type !== "token_transfer" || !txData.token_transfer) {
            return { success: false, error: "Transaction is not a token transfer." };
        }

        // 4️⃣ Verify recipient
        if (txData.token_transfer.recipient_address !== requiredRecipient) {
            return { success: false, error: `Recipient mismatch. Sent to ${txData.token_transfer.recipient_address}` };
        }

        // 5️⃣ Verify amount using x402-stacks conversion
        const requiredMicroStx = STXtoMicroSTX(requiredAmount);
        const txAmountMicroStx = BigInt(txData.token_transfer.amount);

        if (txAmountMicroStx < requiredMicroStx) {
            return { success: false, error: `Insufficient amount. Sent ${txData.token_transfer.amount}, required ${requiredMicroStx}` };
        }

        // 6️⃣ Verify memo
        if (requiredMemo) {
            const txMemo = txData.token_transfer.memo || "";
            if (!txMemo.includes(requiredMemo)) {
                return { success: false, error: "Memo mismatch." };
            }
        }

        return { success: true, sender: txData.sender_address };

    } catch (error: any) {
        console.error("Verification error details:", error);

        let msg = "Network error verifying transaction.";
        if (error.name === 'TimeoutError') msg = "Verification timed out (Stacks API slow).";

        return { success: false, error: msg, retryable: true };
    }
}
