import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
function createClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}
export const db = globalForPrisma.prisma ?? createClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// Auto-heal missing printer connection columns on active database
async function ensurePrinterColumns() {
  const globalRef = globalThis as unknown as { __printerMigrated?: boolean };
  if (globalRef.__printerMigrated) return;
  globalRef.__printerMigrated = true;
  try {
    await db.$executeRawUnsafe(`
      DO $$ BEGIN
          CREATE TYPE "PrinterConnectionType" AS ENUM ('USB', 'LAN', 'SERIAL');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;

      ALTER TABLE "PrinterConfiguration" 
      ADD COLUMN IF NOT EXISTS "connectionType" "PrinterConnectionType" NOT NULL DEFAULT 'USB',
      ADD COLUMN IF NOT EXISTS "ipAddress" TEXT,
      ADD COLUMN IF NOT EXISTS "port" INTEGER DEFAULT 9100;
    `);
  } catch {
    // Non-blocking in case of connection warmup
  }
}

ensurePrinterColumns().catch(() => {});

