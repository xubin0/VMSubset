/*
  Warnings:

  - Added the required column `updatedAt` to the `ProcurementRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProcurementRequest" ADD COLUMN     "actionDueDate" TIMESTAMP(3),
ADD COLUMN     "actionOwner" TEXT,
ADD COLUMN     "actionStatus" TEXT NOT NULL DEFAULT 'NOT_STARTED',
ADD COLUMN     "actualGoLiveDate" TIMESTAMP(3),
ADD COLUMN     "budgetApproval" TIMESTAMP(3),
ADD COLUMN     "businessOwner" TEXT,
ADD COLUMN     "businessRequirementFinalised" TIMESTAMP(3),
ADD COLUMN     "contractSignature" TIMESTAMP(3),
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "currentAction" TEXT,
ADD COLUMN     "currentStage" TEXT,
ADD COLUMN     "dateRaised" TIMESTAMP(3),
ADD COLUMN     "dueDiligenceCompleted" TIMESTAMP(3),
ADD COLUMN     "estimatedAnnualSpend" DECIMAL(65,30),
ADD COLUMN     "finalDecision" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "finalDecisionDate" TIMESTAMP(3),
ADD COLUMN     "initialReviewCompleted" TIMESTAMP(3),
ADD COLUMN     "lastUpdatedBy" TEXT,
ADD COLUMN     "outsourcingAssessmentCompletion" TIMESTAMP(3),
ADD COLUMN     "outsourcingClassification" TEXT,
ADD COLUMN     "outsourcingDetermination" TIMESTAMP(3),
ADD COLUMN     "procurementLead" TEXT,
ADD COLUMN     "productOrService" TEXT,
ADD COLUMN     "requestType" TEXT,
ADD COLUMN     "requestTypeOther" TEXT,
ADD COLUMN     "rfqCompletion" TIMESTAMP(3),
ADD COLUMN     "riskClassificationCompleted" TIMESTAMP(3),
ADD COLUMN     "riskRating" TEXT NOT NULL DEFAULT 'UNASSIGNED',
ADD COLUMN     "setupCompletion" TIMESTAMP(3),
ADD COLUMN     "targetGoLiveDate" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "vendorName" TEXT,
ADD COLUMN     "vendorSubName" TEXT;

-- CreateTable
CREATE TABLE "RiskReview" (
    "id" SERIAL NOT NULL,
    "requestId" INTEGER NOT NULL,
    "riskFunction" TEXT NOT NULL,
    "reviewRequired" TEXT NOT NULL DEFAULT 'TO_BE_DETERMINED',
    "reviewStatus" TEXT NOT NULL DEFAULT 'NOT_SENT',
    "dateSent" TIMESTAMP(3),
    "responseDate" TIMESTAMP(3),
    "outcome" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewer" TEXT,
    "comments" TEXT,
    "conditions" TEXT,
    "followUpActionRequired" BOOLEAN NOT NULL DEFAULT false,
    "actionOwner" TEXT,
    "actionDueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiskReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcurementAction" (
    "id" SERIAL NOT NULL,
    "requestId" INTEGER NOT NULL,
    "reviewId" INTEGER,
    "action" TEXT NOT NULL,
    "owner" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcurementAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinalDecision" (
    "id" SERIAL NOT NULL,
    "requestId" INTEGER NOT NULL,
    "decision" TEXT NOT NULL DEFAULT 'PENDING',
    "decisionDate" TIMESTAMP(3),
    "decisionBy" TEXT,
    "reasonCategory" TEXT,
    "comments" TEXT,
    "conditions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinalDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoryEvent" (
    "id" SERIAL NOT NULL,
    "requestId" INTEGER NOT NULL,
    "eventType" TEXT NOT NULL,
    "changedBy" TEXT,
    "previousValue" TEXT,
    "newValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoryEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RiskReview_requestId_riskFunction_key" ON "RiskReview"("requestId", "riskFunction");

-- CreateIndex
CREATE UNIQUE INDEX "FinalDecision_requestId_key" ON "FinalDecision"("requestId");

-- AddForeignKey
ALTER TABLE "RiskReview" ADD CONSTRAINT "RiskReview_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ProcurementRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementAction" ADD CONSTRAINT "ProcurementAction_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ProcurementRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementAction" ADD CONSTRAINT "ProcurementAction_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "RiskReview"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinalDecision" ADD CONSTRAINT "FinalDecision_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ProcurementRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoryEvent" ADD CONSTRAINT "HistoryEvent_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ProcurementRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
