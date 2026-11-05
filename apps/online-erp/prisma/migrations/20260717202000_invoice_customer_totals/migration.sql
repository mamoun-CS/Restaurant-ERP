-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "customerAddress" TEXT,
ADD COLUMN     "customerName" TEXT,
ADD COLUMN     "customerNotes" TEXT,
ADD COLUMN     "customerPhone" TEXT,
ADD COLUMN     "grandTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "taxAmount" DECIMAL(12,2) NOT NULL DEFAULT 0;
