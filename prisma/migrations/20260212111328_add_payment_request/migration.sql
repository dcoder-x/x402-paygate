-- CreateTable
CREATE TABLE "PaymentRequest" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "asset" TEXT NOT NULL DEFAULT 'STX',
    "recipient" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'POST',
    "headers" JSONB,
    "body" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "txId" TEXT,
    "successUrl" TEXT,
    "cancelUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentRequest_requestId_key" ON "PaymentRequest"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentRequest_txId_key" ON "PaymentRequest"("txId");
