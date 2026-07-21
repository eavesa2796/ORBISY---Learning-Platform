-- Proposal MVP Milestone 1 domain models

CREATE TYPE "SalesOpportunityStage" AS ENUM ('NEW', 'QUALIFIED', 'PROPOSAL_DRAFTED', 'PROPOSAL_SENT', 'WON', 'LOST');
CREATE TYPE "SalesEquipmentType" AS ENUM ('CONDENSER', 'AIR_HANDLER', 'FURNACE', 'HEAT_PUMP', 'COIL', 'PACKAGE_UNIT', 'THERMOSTAT', 'IAQ', 'OTHER');
CREATE TYPE "SalesCatalogPricingMode" AS ENUM ('FIXED_SELL_PRICE', 'COST_PLUS_MARGIN');
CREATE TYPE "SalesProposalStatus" AS ENUM ('DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'DECLINED');
CREATE TYPE "SalesProposalTier" AS ENUM ('GOOD', 'BETTER', 'BEST');
CREATE TYPE "SalesProposalAddonType" AS ENUM ('ADDON', 'DISCOUNT', 'REBATE');
CREATE TYPE "SalesProposalEventType" AS ENUM ('DRAFT_CREATED', 'SENT', 'VIEWED', 'ACCEPTED', 'DECLINED', 'STATUS_CHANGED');

CREATE TABLE "SalesOpportunity" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "contactId" TEXT,
  "title" TEXT NOT NULL,
  "stage" "SalesOpportunityStage" NOT NULL DEFAULT 'NEW',
  "estimatedJobValue" DECIMAL(12,2),
  "targetInstallDate" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SalesOpportunity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SalesHvacCatalogItem" (
  "id" TEXT NOT NULL,
  "equipmentType" "SalesEquipmentType" NOT NULL,
  "brand" TEXT NOT NULL,
  "modelNumber" TEXT NOT NULL,
  "sizeTonnage" TEXT,
  "efficiencyRating" TEXT,
  "cost" DECIMAL(12,2) NOT NULL,
  "pricingMode" "SalesCatalogPricingMode" NOT NULL DEFAULT 'COST_PLUS_MARGIN',
  "sellPrice" DECIMAL(12,2),
  "marginPercent" DOUBLE PRECISION,
  "description" TEXT,
  "imageUrl" TEXT,
  "brochureUrl" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SalesHvacCatalogItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SalesProposal" (
  "id" TEXT NOT NULL,
  "opportunityId" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "contactId" TEXT,
  "publicToken" TEXT NOT NULL,
  "status" "SalesProposalStatus" NOT NULL DEFAULT 'DRAFT',
  "title" TEXT NOT NULL,
  "notes" TEXT,
  "version" INTEGER NOT NULL DEFAULT 1,
  "selectedOptionId" TEXT,
  "createdByUserId" TEXT,
  "sentAt" TIMESTAMP(3),
  "viewedAt" TIMESTAMP(3),
  "acceptedAt" TIMESTAMP(3),
  "declinedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SalesProposal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SalesProposalOption" (
  "id" TEXT NOT NULL,
  "proposalId" TEXT NOT NULL,
  "tier" "SalesProposalTier" NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT,
  "equipmentItemId" TEXT,
  "equipmentSnapshot" JSONB,
  "warrantyLabel" TEXT,
  "financingApr" DOUBLE PRECISION,
  "financingMonths" INTEGER,
  "monthlyPaymentEstimate" DECIMAL(12,2),
  "equipmentCost" DECIMAL(12,2) NOT NULL,
  "laborCost" DECIMAL(12,2) NOT NULL,
  "addonsTotal" DECIMAL(12,2) NOT NULL,
  "discountsTotal" DECIMAL(12,2) NOT NULL,
  "rebatesTotal" DECIMAL(12,2) NOT NULL,
  "totalCost" DECIMAL(12,2) NOT NULL,
  "grossMarginAmount" DECIMAL(12,2) NOT NULL,
  "grossMarginPercent" DOUBLE PRECISION NOT NULL,
  "finalCustomerPrice" DECIMAL(12,2) NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SalesProposalOption_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SalesProposalAddonLine" (
  "id" TEXT NOT NULL,
  "optionId" TEXT NOT NULL,
  "type" "SalesProposalAddonType" NOT NULL,
  "label" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SalesProposalAddonLine_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SalesProposalEvent" (
  "id" TEXT NOT NULL,
  "proposalId" TEXT NOT NULL,
  "eventType" "SalesProposalEventType" NOT NULL,
  "metadata" JSONB,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SalesProposalEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SalesHvacCatalogItem_brand_modelNumber_key" ON "SalesHvacCatalogItem"("brand", "modelNumber");
CREATE UNIQUE INDEX "SalesProposal_publicToken_key" ON "SalesProposal"("publicToken");
CREATE UNIQUE INDEX "SalesProposal_selectedOptionId_key" ON "SalesProposal"("selectedOptionId");
CREATE UNIQUE INDEX "SalesProposalOption_proposalId_tier_key" ON "SalesProposalOption"("proposalId", "tier");

CREATE INDEX "SalesOpportunity_companyId_idx" ON "SalesOpportunity"("companyId");
CREATE INDEX "SalesOpportunity_contactId_idx" ON "SalesOpportunity"("contactId");
CREATE INDEX "SalesOpportunity_stage_idx" ON "SalesOpportunity"("stage");
CREATE INDEX "SalesOpportunity_createdAt_idx" ON "SalesOpportunity"("createdAt");

CREATE INDEX "SalesHvacCatalogItem_equipmentType_idx" ON "SalesHvacCatalogItem"("equipmentType");
CREATE INDEX "SalesHvacCatalogItem_brand_idx" ON "SalesHvacCatalogItem"("brand");
CREATE INDEX "SalesHvacCatalogItem_isActive_idx" ON "SalesHvacCatalogItem"("isActive");

CREATE INDEX "SalesProposal_opportunityId_idx" ON "SalesProposal"("opportunityId");
CREATE INDEX "SalesProposal_companyId_idx" ON "SalesProposal"("companyId");
CREATE INDEX "SalesProposal_contactId_idx" ON "SalesProposal"("contactId");
CREATE INDEX "SalesProposal_status_idx" ON "SalesProposal"("status");
CREATE INDEX "SalesProposal_createdAt_idx" ON "SalesProposal"("createdAt");

CREATE INDEX "SalesProposalOption_proposalId_idx" ON "SalesProposalOption"("proposalId");
CREATE INDEX "SalesProposalOption_equipmentItemId_idx" ON "SalesProposalOption"("equipmentItemId");

CREATE INDEX "SalesProposalAddonLine_optionId_idx" ON "SalesProposalAddonLine"("optionId");
CREATE INDEX "SalesProposalAddonLine_type_idx" ON "SalesProposalAddonLine"("type");

CREATE INDEX "SalesProposalEvent_proposalId_idx" ON "SalesProposalEvent"("proposalId");
CREATE INDEX "SalesProposalEvent_eventType_idx" ON "SalesProposalEvent"("eventType");
CREATE INDEX "SalesProposalEvent_occurredAt_idx" ON "SalesProposalEvent"("occurredAt");

ALTER TABLE "SalesOpportunity"
ADD CONSTRAINT "SalesOpportunity_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "SalesCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SalesOpportunity"
ADD CONSTRAINT "SalesOpportunity_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "SalesContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "SalesProposal"
ADD CONSTRAINT "SalesProposal_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "SalesOpportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SalesProposal"
ADD CONSTRAINT "SalesProposal_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "SalesCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SalesProposal"
ADD CONSTRAINT "SalesProposal_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "SalesContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "SalesProposal"
ADD CONSTRAINT "SalesProposal_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "SalesProposalOption"
ADD CONSTRAINT "SalesProposalOption_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "SalesProposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SalesProposalOption"
ADD CONSTRAINT "SalesProposalOption_equipmentItemId_fkey" FOREIGN KEY ("equipmentItemId") REFERENCES "SalesHvacCatalogItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "SalesProposal"
ADD CONSTRAINT "SalesProposal_selectedOptionId_fkey" FOREIGN KEY ("selectedOptionId") REFERENCES "SalesProposalOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "SalesProposalAddonLine"
ADD CONSTRAINT "SalesProposalAddonLine_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "SalesProposalOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SalesProposalEvent"
ADD CONSTRAINT "SalesProposalEvent_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "SalesProposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
