-- AlterTable
ALTER TABLE "PrintJob" ADD COLUMN     "cashDrawerOpened" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "drawerErrorCode" TEXT,
ADD COLUMN     "openCashDrawer" BOOLEAN NOT NULL DEFAULT false;
