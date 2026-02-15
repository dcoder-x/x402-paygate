-- CreateTable
CREATE TABLE "API" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "pricePerRequest" DOUBLE PRECISION NOT NULL,
    "stacksAddress" TEXT NOT NULL,
    "network" TEXT NOT NULL DEFAULT 'testnet',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "API_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "apiId" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "payerAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "APIRequest" (
    "id" TEXT NOT NULL,
    "apiId" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "responseMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "APIRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_txHash_key" ON "Payment"("txHash");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_apiId_fkey" FOREIGN KEY ("apiId") REFERENCES "API"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APIRequest" ADD CONSTRAINT "APIRequest_apiId_fkey" FOREIGN KEY ("apiId") REFERENCES "API"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
