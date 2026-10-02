-- Backfill legacy purchase orders from the matching vendor contract active on
-- the purchase order date before enforcing the required relationship.
UPDATE "PurchaseOrder" po
SET "contractId" = contract.id
FROM "Contract" contract
WHERE po."contractId" IS NULL
  AND contract."vendorId" = po."vendorId"
  AND po."poDate" >= contract."startDate"
  AND po."poDate" <= contract."endDate";

-- DropForeignKey
ALTER TABLE "PurchaseOrder" DROP CONSTRAINT "PurchaseOrder_contractId_fkey";

-- AlterTable
ALTER TABLE "PurchaseOrder" ALTER COLUMN "contractId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
