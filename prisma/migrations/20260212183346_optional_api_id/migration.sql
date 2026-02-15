-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_apiId_fkey";

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "apiId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_apiId_fkey" FOREIGN KEY ("apiId") REFERENCES "API"("id") ON DELETE SET NULL ON UPDATE CASCADE;
