/*
  Warnings:

  - You are about to drop the column `productOrService` on the `ProcurementRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProcurementRequest" DROP COLUMN "productOrService",
ADD COLUMN     "categoryServiceType" TEXT;
