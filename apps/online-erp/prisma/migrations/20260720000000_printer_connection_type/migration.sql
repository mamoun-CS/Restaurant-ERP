-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "PrinterConnectionType" AS ENUM ('USB', 'LAN', 'SERIAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterTable
ALTER TABLE "PrinterConfiguration" 
ADD COLUMN IF NOT EXISTS "connectionType" "PrinterConnectionType" NOT NULL DEFAULT 'USB',
ADD COLUMN IF NOT EXISTS "ipAddress" TEXT,
ADD COLUMN IF NOT EXISTS "port" INTEGER DEFAULT 9100;
