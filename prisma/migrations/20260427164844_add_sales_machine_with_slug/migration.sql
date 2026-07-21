-- CreateEnum
CREATE TYPE "SalesSourceType" AS ENUM ('GOOGLE_PLACES', 'CSV_IMPORT', 'MANUAL', 'OTHER');

-- CreateEnum
CREATE TYPE "SalesOutreachStatus" AS ENUM ('DRAFT', 'READY', 'APPROVED', 'SENT', 'REPLIED', 'BOUNCED', 'STOPPED');

-- CreateTable
CREATE TABLE "SalesCompany" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "phone" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'US',
    "placeId" TEXT,
    "category" TEXT,
    "rating" DOUBLE PRECISION,
    "reviewCount" INTEGER,
    "sourceType" "SalesSourceType" NOT NULL DEFAULT 'OTHER',
    "sourceRef" TEXT,
    "discoveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isQualified" BOOLEAN NOT NULL DEFAULT false,
    "disqualifiedReason" TEXT,

    CONSTRAINT "SalesCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesContact" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "fullName" TEXT,
    "role" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT,
    "confidence" INTEGER NOT NULL DEFAULT 50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesWebsiteAudit" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "hasOnlineBooking" BOOLEAN NOT NULL DEFAULT false,
    "hasEmergencyCta" BOOLEAN NOT NULL DEFAULT false,
    "hasMissedCallTextBack" BOOLEAN NOT NULL DEFAULT false,
    "hasFastResponsePromise" BOOLEAN NOT NULL DEFAULT false,
    "hasFinancingCta" BOOLEAN NOT NULL DEFAULT false,
    "hasAfterHoursCapture" BOOLEAN NOT NULL DEFAULT false,
    "hasChatOrTextOption" BOOLEAN NOT NULL DEFAULT false,
    "hasStrongReviewProcess" BOOLEAN NOT NULL DEFAULT false,
    "hasClearEstimateFlow" BOOLEAN NOT NULL DEFAULT false,
    "mobilePerformanceScore" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalesWebsiteAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesLeadScore" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "icpFit" INTEGER NOT NULL,
    "revenuePotential" INTEGER NOT NULL,
    "painSignals" INTEGER NOT NULL,
    "contactability" INTEGER NOT NULL,
    "disqualifiers" INTEGER NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "explanation" TEXT NOT NULL,
    "modelVersion" TEXT NOT NULL DEFAULT 'v1',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalesLeadScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesScoreEvidence" (
    "id" TEXT NOT NULL,
    "scoreId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalesScoreEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesKnowledgeDocument" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL DEFAULT 'internal',
    "text" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesKnowledgeDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesKnowledgeChunk" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalesKnowledgeChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesOutreachMessage" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "contactId" TEXT,
    "status" "SalesOutreachStatus" NOT NULL DEFAULT 'DRAFT',
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "personalization" JSONB,
    "retrievedChunkIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "repliedAt" TIMESTAMP(3),

    CONSTRAINT "SalesOutreachMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SalesCompany_slug_key" ON "SalesCompany"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SalesCompany_placeId_key" ON "SalesCompany"("placeId");

-- CreateIndex
CREATE INDEX "SalesCompany_slug_idx" ON "SalesCompany"("slug");

-- CreateIndex
CREATE INDEX "SalesCompany_name_idx" ON "SalesCompany"("name");

-- CreateIndex
CREATE INDEX "SalesCompany_city_state_idx" ON "SalesCompany"("city", "state");

-- CreateIndex
CREATE INDEX "SalesCompany_isQualified_idx" ON "SalesCompany"("isQualified");

-- CreateIndex
CREATE INDEX "SalesCompany_discoveredAt_idx" ON "SalesCompany"("discoveredAt");

-- CreateIndex
CREATE INDEX "SalesContact_companyId_idx" ON "SalesContact"("companyId");

-- CreateIndex
CREATE INDEX "SalesContact_email_idx" ON "SalesContact"("email");

-- CreateIndex
CREATE INDEX "SalesWebsiteAudit_companyId_idx" ON "SalesWebsiteAudit"("companyId");

-- CreateIndex
CREATE INDEX "SalesWebsiteAudit_createdAt_idx" ON "SalesWebsiteAudit"("createdAt");

-- CreateIndex
CREATE INDEX "SalesLeadScore_companyId_idx" ON "SalesLeadScore"("companyId");

-- CreateIndex
CREATE INDEX "SalesLeadScore_totalScore_idx" ON "SalesLeadScore"("totalScore");

-- CreateIndex
CREATE INDEX "SalesLeadScore_createdAt_idx" ON "SalesLeadScore"("createdAt");

-- CreateIndex
CREATE INDEX "SalesScoreEvidence_scoreId_idx" ON "SalesScoreEvidence"("scoreId");

-- CreateIndex
CREATE INDEX "SalesScoreEvidence_code_idx" ON "SalesScoreEvidence"("code");

-- CreateIndex
CREATE INDEX "SalesKnowledgeDocument_isActive_idx" ON "SalesKnowledgeDocument"("isActive");

-- CreateIndex
CREATE INDEX "SalesKnowledgeDocument_createdAt_idx" ON "SalesKnowledgeDocument"("createdAt");

-- CreateIndex
CREATE INDEX "SalesKnowledgeChunk_documentId_idx" ON "SalesKnowledgeChunk"("documentId");

-- CreateIndex
CREATE INDEX "SalesKnowledgeChunk_chunkIndex_idx" ON "SalesKnowledgeChunk"("chunkIndex");

-- CreateIndex
CREATE INDEX "SalesOutreachMessage_companyId_idx" ON "SalesOutreachMessage"("companyId");

-- CreateIndex
CREATE INDEX "SalesOutreachMessage_contactId_idx" ON "SalesOutreachMessage"("contactId");

-- CreateIndex
CREATE INDEX "SalesOutreachMessage_status_idx" ON "SalesOutreachMessage"("status");

-- AddForeignKey
ALTER TABLE "SalesContact" ADD CONSTRAINT "SalesContact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "SalesCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesWebsiteAudit" ADD CONSTRAINT "SalesWebsiteAudit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "SalesCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesLeadScore" ADD CONSTRAINT "SalesLeadScore_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "SalesCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesScoreEvidence" ADD CONSTRAINT "SalesScoreEvidence_scoreId_fkey" FOREIGN KEY ("scoreId") REFERENCES "SalesLeadScore"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesKnowledgeChunk" ADD CONSTRAINT "SalesKnowledgeChunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "SalesKnowledgeDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOutreachMessage" ADD CONSTRAINT "SalesOutreachMessage_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "SalesCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOutreachMessage" ADD CONSTRAINT "SalesOutreachMessage_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "SalesContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
