ALTER TABLE "User"
  ADD COLUMN "offlinePinHash" TEXT,
  ADD COLUMN "offlinePinSalt" TEXT,
  ADD COLUMN "offlinePinExpiresAt" TIMESTAMP(3),
  ADD COLUMN "offlineCredentialVersion" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "canDiscount" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "maxDiscountPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
  ADD COLUMN "maxDiscountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN "supervisor" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "PosDevice" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "deviceCode" TEXT NOT NULL,
  "refreshTokenHash" TEXT NOT NULL,
  "branchId" TEXT NOT NULL,
  "registerId" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "revokedAt" TIMESTAMP(3),
  "appVersion" TEXT,
  "lastHeartbeatAt" TIMESTAMP(3),
  "lastSyncAt" TIMESTAMP(3),
  "lastSyncError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PosDevice_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PosDevice_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "PosDevice_registerId_fkey" FOREIGN KEY ("registerId") REFERENCES "CashRegister"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "PosDevice_deviceCode_key" ON "PosDevice"("deviceCode");
CREATE INDEX "PosDevice_branchId_active_idx" ON "PosDevice"("branchId", "active");
CREATE INDEX "PosDevice_lastHeartbeatAt_idx" ON "PosDevice"("lastHeartbeatAt");

CREATE TABLE "PosDeviceCashier" (
  "id" TEXT NOT NULL,
  "deviceId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PosDeviceCashier_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PosDeviceCashier_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "PosDevice"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PosDeviceCashier_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "PosDeviceCashier_deviceId_userId_key" ON "PosDeviceCashier"("deviceId", "userId");
CREATE INDEX "PosDeviceCashier_userId_active_idx" ON "PosDeviceCashier"("userId", "active");

CREATE TABLE "PosDevicePairingCode" (
  "id" TEXT NOT NULL,
  "codeHash" TEXT NOT NULL,
  "branchId" TEXT NOT NULL,
  "registerId" TEXT,
  "deviceId" TEXT,
  "createdById" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PosDevicePairingCode_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PosDevicePairingCode_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PosDevicePairingCode_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "PosDevice"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "PosDevicePairingCode_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "PosDevicePairingCode_codeHash_key" ON "PosDevicePairingCode"("codeHash");
CREATE INDEX "PosDevicePairingCode_branchId_expiresAt_idx" ON "PosDevicePairingCode"("branchId", "expiresAt");
CREATE INDEX "PosDevicePairingCode_consumedAt_idx" ON "PosDevicePairingCode"("consumedAt");
