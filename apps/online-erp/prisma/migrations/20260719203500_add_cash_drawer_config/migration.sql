-- AlterTable
ALTER TABLE "PrinterConfiguration" ADD COLUMN     "cashDrawerOpenBeforePrint" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "cashDrawerPin" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "cashDrawerPulseOff" INTEGER NOT NULL DEFAULT 250,
ADD COLUMN     "cashDrawerPulseOn" INTEGER NOT NULL DEFAULT 25;
