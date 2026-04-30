-- Add complianceSnapshot field to SalesOutreachMessage for audit trail
ALTER TABLE "SalesOutreachMessage" ADD COLUMN "complianceSnapshot" JSONB;
