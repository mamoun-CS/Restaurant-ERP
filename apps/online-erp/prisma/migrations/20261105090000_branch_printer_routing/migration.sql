ALTER TABLE "CategoryPrinterRoute" ADD COLUMN "branchId" TEXT;

ALTER TABLE "CategoryPrinterRoute"
ADD CONSTRAINT "CategoryPrinterRoute_branchId_fkey"
FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

DROP INDEX IF EXISTS "CategoryPrinterRoute_categoryId_key";
CREATE UNIQUE INDEX "CategoryPrinterRoute_categoryId_branchId_key"
ON "CategoryPrinterRoute"("categoryId", "branchId");
CREATE INDEX "CategoryPrinterRoute_branchId_idx" ON "CategoryPrinterRoute"("branchId");
