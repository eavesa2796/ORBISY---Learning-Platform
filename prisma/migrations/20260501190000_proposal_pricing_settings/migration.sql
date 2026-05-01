-- Proposal pricing settings and per-option permit/tax support

CREATE TABLE "SalesProposalSettings" (
  "id" TEXT NOT NULL DEFAULT 'default',
  "defaultLaborCost" DECIMAL(12,2) NOT NULL DEFAULT 1500,
  "defaultFinancingApr" DOUBLE PRECISION NOT NULL DEFAULT 8.99,
  "defaultFinancingMonths" INTEGER NOT NULL DEFAULT 120,
  "defaultWarrantyGood" TEXT NOT NULL DEFAULT '10-year parts',
  "defaultWarrantyBetter" TEXT NOT NULL DEFAULT '10-year parts + 2-year labor',
  "defaultWarrantyBest" TEXT NOT NULL DEFAULT '10-year parts + 10-year labor',
  "permitFeeDefault" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "taxRatePercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "companyProposalFooter" TEXT NOT NULL DEFAULT 'Thank you for considering ORBISY for your HVAC project.',
  "proposalDisclaimer" TEXT NOT NULL DEFAULT 'Pricing and incentives are valid for 30 days unless otherwise noted. Final installation scope may require on-site verification. Financing is subject to lender approval.',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SalesProposalSettings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "SalesProposalSettings" (
  "id",
  "defaultLaborCost",
  "defaultFinancingApr",
  "defaultFinancingMonths",
  "defaultWarrantyGood",
  "defaultWarrantyBetter",
  "defaultWarrantyBest",
  "permitFeeDefault",
  "taxRatePercent",
  "companyProposalFooter",
  "proposalDisclaimer"
)
VALUES (
  'default',
  1500,
  8.99,
  120,
  '10-year parts',
  '10-year parts + 2-year labor',
  '10-year parts + 10-year labor',
  0,
  0,
  'Thank you for considering ORBISY for your HVAC project.',
  'Pricing and incentives are valid for 30 days unless otherwise noted. Final installation scope may require on-site verification. Financing is subject to lender approval.'
)
ON CONFLICT ("id") DO NOTHING;

ALTER TABLE "SalesProposal"
ADD COLUMN "companyProposalFooter" TEXT,
ADD COLUMN "proposalDisclaimer" TEXT;

ALTER TABLE "SalesProposalOption"
ADD COLUMN "permitFee" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN "taxRatePercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "taxAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN "preTaxCustomerPrice" DECIMAL(12,2) NOT NULL DEFAULT 0;

UPDATE "SalesProposalOption"
SET "preTaxCustomerPrice" = "finalCustomerPrice";
