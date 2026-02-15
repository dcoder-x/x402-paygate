export interface PayGateRequest {
    target: string;
    method: "GET" | "POST" | "PUT" | "DELETE";
    price: string;
    asset: "STX";
    recipient: string;
    body?: any;
    headers?: Record<string, string>;
}

export interface PaymentRequest extends PayGateRequest {
    requestId: string;
    status: "IDLE" | "PENDING" | "PAID" | "COMPLETED" | "FAILED";
    createdAt: number;
    txId?: string;
    successUrl?: string;
    cancelUrl?: string;
    failureReason?: string;
}

export interface PayGateResponse {
    requestId: string;
    checkoutUrl: string;
    network: "stacks-testnet" | "stacks-mainnet";
    asset: "STX";
    amount: string;
    recipient: string;
    expiresAt: number;
}

export interface ErrorResponse {
    error: string;
    code: string;
    payment?: PayGateResponse;
}
