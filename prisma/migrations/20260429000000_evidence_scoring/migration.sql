-- AddColumns to SalesWebsiteAudit
ALTER TABLE "SalesWebsiteAudit" ADD COLUMN "auditVersion" TEXT NOT NULL DEFAULT 'v1';
ALTER TABLE "SalesWebsiteAudit" ADD COLUMN "auditedUrl" TEXT;
ALTER TABLE "SalesWebsiteAudit" ADD COLUMN "crawlStatus" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "SalesWebsiteAudit" ADD COLUMN "crawlError" TEXT;
ALTER TABLE "SalesWebsiteAudit" ADD COLUMN "auditedAt" TIMESTAMP(3);
ALTER TABLE "SalesWebsiteAudit" ADD COLUMN "detectedTools" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- CreateTable SalesAuditEvidence
CREATE TABLE "SalesAuditEvidence" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "observed" BOOLEAN NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "confidence" INTEGER NOT NULL DEFAULT 80,
    "sourceUrl" TEXT,
    "snippet" TEXT,
    "screenshotUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SalesAuditEvidence_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey SalesAuditEvidence -> SalesWebsiteAudit
ALTER TABLE "SalesAuditEvidence" ADD CONSTRAINT "SalesAuditEvidence_auditId_fkey"
    FOREIGN KEY ("auditId") REFERENCES "SalesWebsiteAudit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex SalesAuditEvidence
CREATE INDEX "SalesAuditEvidence_auditId_idx" ON "SalesAuditEvidence"("auditId");
CREATE INDEX "SalesAuditEvidence_code_idx" ON "SalesAuditEvidence"("code");

-- AddColumns to SalesLeadScore
ALTER TABLE "SalesLeadScore" ADD COLUMN "buyingLikelihood" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "SalesLeadScore" ADD COLUMN "dealThesis" TEXT;
ALTER TABLE "SalesLeadScore" ADD COLUMN "thesisConfidence" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex SalesLeadScore buyingLikelihood
CREATE INDEX "SalesLeadScore_buyingLikelihood_idx" ON "SalesLeadScore"("buyingLikelihood");

-- AddColumns to SalesOutreachMessage
ALTER TABLE "SalesOutreachMessage" ADD COLUMN "bounceType" TEXT;
ALTER TABLE "SalesOutreachMessage" ADD COLUMN "bounceReason" TEXT;
