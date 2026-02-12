import prisma from "@/lib/prisma";
import { PaymentRequest } from "./types";

export const storage = {
    create: async (requestId: string, data: PaymentRequest) => {
        await prisma.paymentRequest.create({
            data: {
                id: requestId,
                requestId: data.requestId,
                price: data.price,
                asset: data.asset,
                recipient: data.recipient,
                target: data.target,
                method: data.method,
                headers: data.headers as any,
                body: data.body as any,
                status: data.status,
                createdAt: new Date(data.createdAt),
                successUrl: data.successUrl,
                cancelUrl: data.cancelUrl
            }
        });
    },
    get: async (requestId: string): Promise<PaymentRequest | null> => {
        const req = await prisma.paymentRequest.findUnique({
            where: { requestId }
        });

        if (!req) return null;

        return {
            requestId: req.requestId,
            price: req.price,
            asset: req.asset as "STX",
            recipient: req.recipient,
            target: req.target,
            method: req.method as any,
            headers: req.headers as any,
            body: req.body as any,
            status: req.status as any,
            createdAt: req.createdAt.getTime(),
            txId: req.txId || undefined,
            successUrl: req.successUrl || undefined,
            cancelUrl: req.cancelUrl || undefined
        };
    },
    updateStatus: async (requestId: string, status: "IDLE" | "PENDING" | "PAID" | "COMPLETED" | "FAILED", txId?: string) => {
        await prisma.paymentRequest.update({
            where: { requestId },
            data: {
                status,
                ...(txId ? { txId } : {})
            }
        });
    },
    has: async (requestId: string) => {
        const count = await prisma.paymentRequest.count({
            where: { requestId }
        });
        return count > 0;
    }
};
