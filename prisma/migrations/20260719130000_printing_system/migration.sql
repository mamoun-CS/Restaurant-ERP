CREATE TYPE "PrintDeviceStatus" AS ENUM ('ONLINE', 'OFFLINE', 'DISABLED');
CREATE TYPE "PrinterType" AS ENUM ('CASHIER', 'KITCHEN', 'BAR', 'LABEL', 'REPORT');
CREATE TYPE "PaperWidth" AS ENUM ('W58', 'W80', 'A4', 'CUSTOM');
CREATE TYPE "PrintJobType" AS ENUM ('CUSTOMER_RECEIPT', 'KITCHEN_TICKET', 'BAR_TICKET', 'SHIFT_CLOSE_REPORT', 'LABEL', 'TEST_PRINT');
CREATE TYPE "PrintContentType" AS ENUM ('HTML', 'ESC_POS');
CREATE TYPE "PrintJobStatus" AS ENUM ('PENDING', 'SENT', 'PROCESSING', 'PRINTED', 'FAILED', 'CANCELLED');

CREATE TABLE "PrintDevice" (
  "id" TEXT NOT NULL,
  "branchId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "deviceCode" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "status" "PrintDeviceStatus" NOT NULL DEFAULT 'OFFLINE',
  "operatingSystem" TEXT,
  "appVersion" TEXT,
  "localPrinters" JSONB,
  "lastConnectedAt" TIMESTAMP(3),
  "lastHeartbeatAt" TIMESTAMP(3),
  "disabledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PrintDevice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PrintPairingCode" (
  "id" TEXT NOT NULL,
  "branchId" TEXT NOT NULL,
  "printDeviceId" TEXT,
  "codeHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PrintPairingCode_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PrinterConfiguration" (
  "id" TEXT NOT NULL,
  "branchId" TEXT NOT NULL,
  "printDeviceId" TEXT NOT NULL,
  "printerType" "PrinterType" NOT NULL,
  "localPrinterName" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "paperWidth" "PaperWidth" NOT NULL DEFAULT 'W80',
  "customWidthMm" INTEGER,
  "copies" INTEGER NOT NULL DEFAULT 1,
  "autoPrint" BOOLEAN NOT NULL DEFAULT true,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "openCashDrawer" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PrinterConfiguration_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductPrinterRoute" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "printerConfigurationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProductPrinterRoute_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CategoryPrinterRoute" (
  "id" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "printerConfigurationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CategoryPrinterRoute_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PrintJob" (
  "id" TEXT NOT NULL,
  "branchId" TEXT NOT NULL,
  "printDeviceId" TEXT,
  "printerConfigurationId" TEXT,
  "invoiceId" TEXT,
  "kitchenOrderId" TEXT,
  "originalPrintJobId" TEXT,
  "jobType" "PrintJobType" NOT NULL,
  "contentType" "PrintContentType" NOT NULL DEFAULT 'HTML',
  "content" TEXT NOT NULL,
  "copies" INTEGER NOT NULL DEFAULT 1,
  "paperWidth" "PaperWidth" NOT NULL DEFAULT 'W80',
  "customWidthMm" INTEGER,
  "status" "PrintJobStatus" NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "maxAttempts" INTEGER NOT NULL DEFAULT 5,
  "errorCode" TEXT,
  "errorMessage" TEXT,
  "idempotencyKey" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "sentAt" TIMESTAMP(3),
  "processingAt" TIMESTAMP(3),
  "printedAt" TIMESTAMP(3),
  "failedAt" TIMESTAMP(3),
  "cancelledAt" TIMESTAMP(3),
  CONSTRAINT "PrintJob_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PrintDevice_deviceCode_key" ON "PrintDevice"("deviceCode");
CREATE INDEX "PrintDevice_branchId_status_idx" ON "PrintDevice"("branchId", "status");
CREATE INDEX "PrintDevice_lastHeartbeatAt_idx" ON "PrintDevice"("lastHeartbeatAt");
CREATE UNIQUE INDEX "PrintPairingCode_codeHash_key" ON "PrintPairingCode"("codeHash");
CREATE INDEX "PrintPairingCode_branchId_expiresAt_idx" ON "PrintPairingCode"("branchId", "expiresAt");
CREATE INDEX "PrintPairingCode_usedAt_idx" ON "PrintPairingCode"("usedAt");
CREATE INDEX "PrinterConfiguration_branchId_printerType_enabled_idx" ON "PrinterConfiguration"("branchId", "printerType", "enabled");
CREATE INDEX "PrinterConfiguration_printDeviceId_enabled_idx" ON "PrinterConfiguration"("printDeviceId", "enabled");
CREATE UNIQUE INDEX "ProductPrinterRoute_productId_key" ON "ProductPrinterRoute"("productId");
CREATE INDEX "ProductPrinterRoute_printerConfigurationId_idx" ON "ProductPrinterRoute"("printerConfigurationId");
CREATE UNIQUE INDEX "CategoryPrinterRoute_categoryId_key" ON "CategoryPrinterRoute"("categoryId");
CREATE INDEX "CategoryPrinterRoute_printerConfigurationId_idx" ON "CategoryPrinterRoute"("printerConfigurationId");
CREATE UNIQUE INDEX "PrintJob_idempotencyKey_key" ON "PrintJob"("idempotencyKey");
CREATE INDEX "PrintJob_branchId_status_createdAt_idx" ON "PrintJob"("branchId", "status", "createdAt");
CREATE INDEX "PrintJob_printDeviceId_status_createdAt_idx" ON "PrintJob"("printDeviceId", "status", "createdAt");
CREATE INDEX "PrintJob_printerConfigurationId_status_idx" ON "PrintJob"("printerConfigurationId", "status");
CREATE INDEX "PrintJob_invoiceId_idx" ON "PrintJob"("invoiceId");
CREATE INDEX "PrintJob_kitchenOrderId_idx" ON "PrintJob"("kitchenOrderId");

ALTER TABLE "PrintDevice" ADD CONSTRAINT "PrintDevice_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PrintPairingCode" ADD CONSTRAINT "PrintPairingCode_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PrintPairingCode" ADD CONSTRAINT "PrintPairingCode_printDeviceId_fkey" FOREIGN KEY ("printDeviceId") REFERENCES "PrintDevice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PrinterConfiguration" ADD CONSTRAINT "PrinterConfiguration_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PrinterConfiguration" ADD CONSTRAINT "PrinterConfiguration_printDeviceId_fkey" FOREIGN KEY ("printDeviceId") REFERENCES "PrintDevice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductPrinterRoute" ADD CONSTRAINT "ProductPrinterRoute_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductPrinterRoute" ADD CONSTRAINT "ProductPrinterRoute_printerConfigurationId_fkey" FOREIGN KEY ("printerConfigurationId") REFERENCES "PrinterConfiguration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CategoryPrinterRoute" ADD CONSTRAINT "CategoryPrinterRoute_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CategoryPrinterRoute" ADD CONSTRAINT "CategoryPrinterRoute_printerConfigurationId_fkey" FOREIGN KEY ("printerConfigurationId") REFERENCES "PrinterConfiguration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PrintJob" ADD CONSTRAINT "PrintJob_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PrintJob" ADD CONSTRAINT "PrintJob_printDeviceId_fkey" FOREIGN KEY ("printDeviceId") REFERENCES "PrintDevice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PrintJob" ADD CONSTRAINT "PrintJob_printerConfigurationId_fkey" FOREIGN KEY ("printerConfigurationId") REFERENCES "PrinterConfiguration"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PrintJob" ADD CONSTRAINT "PrintJob_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PrintJob" ADD CONSTRAINT "PrintJob_kitchenOrderId_fkey" FOREIGN KEY ("kitchenOrderId") REFERENCES "KitchenOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PrintJob" ADD CONSTRAINT "PrintJob_originalPrintJobId_fkey" FOREIGN KEY ("originalPrintJobId") REFERENCES "PrintJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;
