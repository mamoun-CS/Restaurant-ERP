ALTER TABLE "DiscountCampaign"
ADD COLUMN "couponCode" TEXT,
ADD COLUMN "maxUses" INTEGER,
ADD COLUMN "usedCount" INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX "DiscountCampaign_couponCode_key" ON "DiscountCampaign"("couponCode");
