-- Expand UserRole enum for RBAC and map legacy USER records to SALES
CREATE TYPE "UserRole_new" AS ENUM ('ADMIN', 'SALES', 'CUSTOMER');

ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;

ALTER TABLE "User"
ALTER COLUMN "role" TYPE "UserRole_new"
USING (
	CASE
		WHEN "role"::text = 'USER' THEN 'SALES'
		ELSE "role"::text
	END::"UserRole_new"
);

ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";

ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'SALES';

-- Customer linkage for portal permissions
ALTER TABLE "User"
ADD COLUMN "customerCompanyId" TEXT,
ADD COLUMN "customerContactId" TEXT;

ALTER TABLE "User"
ADD CONSTRAINT "User_customerCompanyId_fkey"
FOREIGN KEY ("customerCompanyId") REFERENCES "SalesCompany"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "User"
ADD CONSTRAINT "User_customerContactId_fkey"
FOREIGN KEY ("customerContactId") REFERENCES "SalesContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_customerCompanyId_idx" ON "User"("customerCompanyId");
CREATE INDEX "User_customerContactId_idx" ON "User"("customerContactId");
