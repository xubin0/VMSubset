const prisma = require("../lib/prisma");

const RISK_FUNCTIONS = ["Business Head", "DPVM", "Compliance", "Cyber Security", "IT Infrastructure", "Platform", "Legal", "AI Lead"];
const REQUEST_TYPES = ["NEW_VENDOR", "RENEWAL", "ADDITIONAL_SERVICE", "TRIAL_OR_POC", "OTHER"];
const CATEGORIES = ["Research", "Market Data", "Trading applications, IT, Infrastructure/Enterprise Applications", "Business Operating Expenses", "Other Professional Services", "Others"];
const RISK_RATINGS = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "UNASSIGNED"];
const STATUSES = ["DRAFT", "OPEN", "IN_PROGRESS", "AWAITING_RESPONSE", "ON_HOLD", "APPROVED", "REJECTED", "WITHDRAWN", "COMPLETED"];
const STAGES = ["Business Requirement Finalisation", "Initial Review", "Budget Approval", "RFQ or Vendor Selection", "Risk Classification and Materiality Assessment", "Due Diligence Review", "Outsourcing Determination", "Outsourcing Risk Assessment", "Final Approval", "Contract Signature and Setup", "Onboarding Complete"];
const REVIEW_STATUSES = ["NOT_SENT", "SENT", "AWAITING_RESPONSE", "RESPONDED", "CLARIFICATION_REQUIRED", "NOT_REQUIRED"];
const OUTCOMES = ["PENDING", "APPROVED", "APPROVED_WITH_CONDITIONS", "NO_OBJECTION", "REJECTED", "NOT_APPLICABLE"];
const ACTION_STATUSES = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "BLOCKED", "CANCELLED"];
const DECISIONS = ["PENDING", "APPROVED", "REJECTED"];
const REASON_CATEGORIES = ["Approved", "Budget Not Approved", "Risk Not Accepted", "Due Diligence Unsuccessful", "Business Requirement Withdrawn", "Alternative Vendor Selected", "Insufficient Information", "Other"];
const PRESET_FIELDS = ["vendorName", "vendorSubName", "categoryServiceType", "businessOwner", "procurementLead", "requestType", "requestTypeOther", "riskRating", "currentStage", "currentAction", "actionOwner", "createdBy"];
const PRESET_LABELS = { vendorName: "Vendor name", vendorSubName: "Vendor sub-name", categoryServiceType: "Category/Service Type", businessOwner: "Business owner or requestor", procurementLead: "Procurement lead", requestType: "Request type", requestTypeOther: "Other request type", riskRating: "Risk rating", currentStage: "Current stage", currentAction: "Current action or next step", actionOwner: "Action owner", createdBy: "Created by" };

const requestInclude = {
  reviews: { include: { actions: true }, orderBy: { riskFunction: "asc" } },
  actions: { orderBy: { dueDate: "asc" } },
  decision: true,
  history: { orderBy: { createdAt: "desc" } }
};

function date(value) { return value ? new Date(value) : null; }
function required(value) { return value !== undefined && value !== null && String(value).trim() !== ""; }
function error(res, message, status = 400) { return res.status(status).json({ error: message }); }
function outstanding(review) { return review.reviewRequired === "YES" && (review.reviewStatus !== "RESPONDED" || review.outcome === "PENDING" || review.outcome === "REJECTED"); }
function serializeRequest(request) {
  const reviews = request.reviews || [];
  return {
    ...request,
    outstandingReviews: reviews.filter((review) => outstanding(review)).length,
    rejectedReviews: reviews.filter((review) => review.reviewRequired === "YES" && review.outcome === "REJECTED").length,
    clarificationRequired: reviews.some((review) => review.reviewRequired === "YES" && review.reviewStatus === "CLARIFICATION_REQUIRED"),
    readyForApproval: reviews.filter((review) => review.reviewRequired === "YES").every((review) => review.reviewStatus === "RESPONDED" && review.outcome !== "PENDING" && review.outcome !== "REJECTED")
  };
}

async function presetValues(fieldName) {
  const rows = await prisma.presetValue.findMany({ where: { fieldName, active: true }, select: { value: true } });
  return rows.map((row) => row.value);
}

async function validateRequest(body, existing = null) {
  const value = { ...(existing || {}), ...body };
  const problems = [];
  const [requestTypes, categories, riskRatings, stages] = await Promise.all([presetValues("requestType"), presetValues("categoryServiceType"), presetValues("riskRating"), presetValues("currentStage")]);
  if (!required(value.vendorName)) problems.push("Vendor Name is required");
  if (!required(value.businessOwner || value.requestedBy)) problems.push("Business Owner or Requestor is required");
  if (!required(value.procurementLead)) problems.push("Procurement Lead is required");
  if (value.requestType && ![...REQUEST_TYPES, ...requestTypes].includes(value.requestType)) problems.push("Request Type is invalid");
  if (value.categoryServiceType && ![...CATEGORIES, ...categories].includes(value.categoryServiceType)) problems.push("Category/Service Type is invalid");
  if (value.category && !CATEGORIES.includes(value.category)) problems.push("Category is invalid");
  if (value.requestType === "OTHER" && !required(value.requestTypeOther)) problems.push("Request Type description is required");
  if (value.riskRating && ![...RISK_RATINGS, ...riskRatings].includes(value.riskRating)) problems.push("Risk Rating is invalid");
  if (value.currentStage && ![...STAGES, ...stages].includes(value.currentStage)) problems.push("Current Stage is invalid");
  if (value.status && !STATUSES.includes(value.status)) problems.push("Overall Status is invalid");
  if (value.status && value.status !== "DRAFT" && !required(value.currentStage)) problems.push("Current Stage is required before submission");
  if (value.actualGoLiveDate && value.dateRaised && date(value.actualGoLiveDate) < date(value.dateRaised)) problems.push("Actual Go Live Date cannot be earlier than Date Raised");
  return problems;
}

async function logEvent(tx, requestId, eventType, changedBy, previousValue, newValue) {
  return tx.historyEvent.create({ data: { requestId, eventType, changedBy, previousValue: previousValue == null ? null : JSON.stringify(previousValue), newValue: newValue == null ? null : JSON.stringify(newValue) } });
}

async function getRequests(req, res) {
  try {
    const { q, status, stage, decision, owner, riskRating, requestType } = req.query;
    const where = { AND: [] };
    if (q) where.AND.push({ OR: [{ requestNumber: { contains: q, mode: "insensitive" } }, { vendorName: { contains: q, mode: "insensitive" } }, { categoryServiceType: { contains: q, mode: "insensitive" } }, { businessOwner: { contains: q, mode: "insensitive" } }] });
    if (status) where.AND.push({ status });
    if (stage) where.AND.push({ currentStage: stage });
    if (decision) where.AND.push({ finalDecision: decision });
    if (owner) where.AND.push({ OR: [{ businessOwner: { contains: owner, mode: "insensitive" } }, { procurementLead: { contains: owner, mode: "insensitive" } }, { actionOwner: { contains: owner, mode: "insensitive" } }] });
    if (riskRating) where.AND.push({ riskRating });
    if (requestType) where.AND.push({ requestType });
    const requests = await prisma.procurementRequest.findMany({ where: where.AND.length ? where : {}, include: requestInclude, orderBy: { updatedAt: "desc" } });
    res.json(requests.map(serializeRequest));
  } catch (e) { res.status(500).json({ error: "Failed to fetch requests" }); }
}

async function getRequest(req, res) {
  try {
    const request = await prisma.procurementRequest.findUnique({ where: { id: Number(req.params.id) }, include: requestInclude });
    if (!request) return error(res, "Request not found", 404);
    res.json(serializeRequest(request));
  } catch (e) { res.status(500).json({ error: "Failed to fetch request" }); }
}

async function createRequest(req, res) {
  const problems = await validateRequest(req.body);
  if (problems.length && req.body.status !== "DRAFT") return error(res, problems.join("; "));
  try {
    const year = new Date().getFullYear();
    const count = await prisma.procurementRequest.count({ where: { requestNumber: { startsWith: `PR-${year}-` } } });
    const requestNumber = `PR-${year}-${String(count + 1).padStart(4, "0")}`;
    const { reviews: requestedReviews, ...requestBody } = req.body;
    const data = { ...requestBody, requestNumber, department: req.body.department || "Procurement", requestedBy: req.body.requestedBy || req.body.businessOwner || "", purpose: req.body.purpose || req.body.categoryServiceType || "", businessNeed: req.body.businessNeed || "", budgeted: Boolean(req.body.budgeted), costCenter: req.body.costCenter || "", dateRaised: date(req.body.dateRaised) || new Date(), actionDueDate: date(req.body.actionDueDate), targetGoLiveDate: date(req.body.targetGoLiveDate), actualGoLiveDate: date(req.body.actualGoLiveDate), status: req.body.status || "DRAFT", riskRating: req.body.riskRating || "UNASSIGNED", finalDecision: "PENDING", actionStatus: req.body.actionStatus || "NOT_STARTED", createdBy: req.body.createdBy || req.body.businessOwner || req.body.requestedBy, lastUpdatedBy: req.body.createdBy || req.body.businessOwner || req.body.requestedBy };
    const request = await prisma.$transaction(async (tx) => {
      const created = await tx.procurementRequest.create({ data, include: requestInclude });
      const reviews = requestedReviews || RISK_FUNCTIONS.map((riskFunction) => ({ riskFunction, reviewRequired: "TO_BE_DETERMINED" }));
      for (const review of reviews) await tx.riskReview.create({ data: { requestId: created.id, riskFunction: review.riskFunction, reviewRequired: review.reviewRequired || "TO_BE_DETERMINED", reviewStatus: review.reviewRequired === "NO" ? "NOT_REQUIRED" : "NOT_SENT" } });
      await logEvent(tx, created.id, "CREATED", data.createdBy, null, requestNumber);
      return tx.procurementRequest.findUnique({ where: { id: created.id }, include: requestInclude });
    });
    res.status(201).json(serializeRequest(request));
  } catch (e) { res.status(500).json({ error: "Failed to create request" }); }
}

async function updateRequest(req, res) {
  try {
    const current = await prisma.procurementRequest.findUnique({ where: { id: Number(req.params.id) }, include: requestInclude });
    if (!current) return error(res, "Request not found", 404);
    const problems = await validateRequest(req.body, current);
    if (problems.length && req.body.status && req.body.status !== "DRAFT") return error(res, problems.join("; "));
    const requestedReviews = req.body.reviews || [];
    const editableFields = ["department", "requestedBy", "purpose", "businessNeed", "budgeted", "costCenter", "notes", "dateRaised", "vendorName", "vendorSubName", "categoryServiceType", "businessOwner", "procurementLead", "requestType", "requestTypeOther", "estimatedAnnualSpend", "riskRating", "currentStage", "finalDecision", "currentAction", "actionOwner", "actionDueDate", "actionStatus", "targetGoLiveDate", "actualGoLiveDate", "createdBy", "lastUpdatedBy", "businessRequirementFinalised", "initialReviewCompleted", "budgetApproval", "rfqCompletion", "riskClassificationCompleted", "dueDiligenceCompleted", "outsourcingDetermination", "outsourcingAssessmentCompletion", "finalDecisionDate", "contractSignature", "setupCompletion", "outsourcingClassification", "status"];
    const data = Object.fromEntries(editableFields.filter((field) => req.body[field] !== undefined).map((field) => [field, req.body[field]]));
    for (const field of ["dateRaised", "actionDueDate", "targetGoLiveDate", "actualGoLiveDate", "businessRequirementFinalised", "initialReviewCompleted", "budgetApproval", "rfqCompletion", "riskClassificationCompleted", "dueDiligenceCompleted", "outsourcingDetermination", "outsourcingAssessmentCompletion", "finalDecisionDate", "contractSignature", "setupCompletion"]) if (data[field] !== undefined) data[field] = date(data[field]);
    if (!data.lastUpdatedBy) data.lastUpdatedBy = req.body.updatedBy;
    const request = await prisma.$transaction(async (tx) => {
      const updated = await tx.procurementRequest.update({ where: { id: current.id }, data, include: requestInclude });
      for (const field of ["currentStage", "status", "finalDecision", "actionStatus", "riskRating"]) if (req.body[field] !== undefined && req.body[field] !== current[field]) await logEvent(tx, current.id, `${field.toUpperCase()}_CHANGED`, data.lastUpdatedBy, current[field], req.body[field]);
      for (const requestedReview of requestedReviews) {
        const existingReview = current.reviews.find((review) => review.riskFunction === requestedReview.riskFunction);
        if (!existingReview || !["YES", "NO", "TO_BE_DETERMINED"].includes(requestedReview.reviewRequired)) continue;
        const reviewStatus = requestedReview.reviewRequired === "YES" ? (existingReview.reviewStatus === "NOT_REQUIRED" ? "NOT_SENT" : existingReview.reviewStatus) : "NOT_REQUIRED";
        const reviewData = requestedReview.reviewRequired === "YES" ? { reviewRequired: requestedReview.reviewRequired, reviewStatus } : { reviewRequired: requestedReview.reviewRequired, reviewStatus, outcome: "NOT_APPLICABLE", responseDate: null, reviewer: null, comments: null, conditions: null, followUpActionRequired: false, actionOwner: null, actionDueDate: null };
        await tx.riskReview.update({ where: { id: existingReview.id }, data: reviewData });
        if (existingReview.reviewRequired !== requestedReview.reviewRequired) await logEvent(tx, current.id, "REVIEW_REQUIREMENT_CHANGED", data.lastUpdatedBy, existingReview.reviewRequired, requestedReview.reviewRequired);
      }
      return updated;
    });
    res.json(serializeRequest(request));
  } catch (e) { res.status(500).json({ error: "Failed to update request" }); }
}

async function deleteRequest(req, res) {
  try {
    const requestId = Number(req.params.id);
    const request = await prisma.procurementRequest.findUnique({ where: { id: requestId }, select: { id: true } });
    if (!request) return error(res, "Request not found", 404);
    await prisma.procurementRequest.delete({ where: { id: requestId } });
    res.status(204).send();
  } catch (e) { res.status(500).json({ error: "Failed to delete request" }); }
}

async function updateReview(req, res) {
  try {
    const review = await prisma.riskReview.findUnique({ where: { id: Number(req.params.id) }, include: { request: true } });
    if (!review) return error(res, "Review not found", 404);
    const body = req.body;
    if (body.reviewRequired && !["YES", "NO", "TO_BE_DETERMINED"].includes(body.reviewRequired)) return error(res, "Review required value is invalid");
    if (body.reviewStatus && !REVIEW_STATUSES.includes(body.reviewStatus)) return error(res, "Review status is invalid");
    if (body.outcome && !OUTCOMES.includes(body.outcome)) return error(res, "Review outcome is invalid");
    if (body.outcome === "APPROVED_WITH_CONDITIONS" && !required(body.conditions || review.conditions)) return error(res, "Conditions are required for Approved with Conditions");
    const sent = body.dateSent === undefined ? review.dateSent : date(body.dateSent);
    const response = body.responseDate === undefined ? review.responseDate : date(body.responseDate);
    if (sent && response && response < sent) return error(res, "Response Date cannot be earlier than Date Sent");
    const requiredValue = body.reviewRequired === undefined ? review.reviewRequired : body.reviewRequired;
    const inactiveReview = requiredValue !== "YES";
    const data = inactiveReview ? { reviewRequired: requiredValue, reviewStatus: "NOT_REQUIRED", outcome: "NOT_APPLICABLE", dateSent: null, responseDate: null, reviewer: null, comments: null, conditions: null, followUpActionRequired: false, actionOwner: null, actionDueDate: null } : { ...body, reviewRequired: requiredValue, reviewStatus: body.reviewStatus || (review.reviewStatus === "NOT_REQUIRED" ? "NOT_SENT" : review.reviewStatus), dateSent: body.dateSent === undefined ? undefined : sent, responseDate: body.responseDate === undefined ? undefined : response, actionDueDate: body.actionDueDate === undefined ? undefined : date(body.actionDueDate) };
    delete data.id; delete data.requestId; delete data.request;
    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.riskReview.update({ where: { id: review.id }, data });
      for (const field of ["reviewStatus", "outcome"]) if (body[field] !== undefined && body[field] !== review[field]) await logEvent(tx, review.requestId, `REVIEW_${field.toUpperCase()}_CHANGED`, body.updatedBy, review[field], body[field]);
      return result;
    });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: "Failed to update review" }); }
}

async function saveDecision(req, res) {
  const body = req.body;
  if (!DECISIONS.includes(body.decision)) return error(res, "Decision is invalid");
  if (["APPROVED", "REJECTED"].includes(body.decision) && (!required(body.decisionDate) || !required(body.decisionBy))) return error(res, "Decision Date and Decision By are required");
  if (body.decision === "REJECTED" && (!required(body.reasonCategory) || !required(body.comments))) return error(res, "Rejected decisions require a reason category and comments");
  if (body.decision === "APPROVED_WITH_CONDITIONS" && !required(body.conditions)) return error(res, "Conditions are required");
  try {
    const request = await prisma.procurementRequest.findUnique({ where: { id: Number(req.params.id) }, include: { reviews: true } });
    if (!request) return error(res, "Request not found", 404);
    if (body.decision === "APPROVED") {
      const unresolved = request.reviews.filter((review) => review.reviewRequired === "YES" && (review.reviewStatus !== "RESPONDED" || review.outcome === "PENDING" || review.outcome === "REJECTED"));
      if (unresolved.length) return error(res, "Final approval is blocked while required reviews are unresolved or rejected");
    }
    const result = await prisma.$transaction(async (tx) => {
      const decision = await tx.finalDecision.upsert({ where: { requestId: request.id }, update: { ...body, decisionDate: date(body.decisionDate) }, create: { requestId: request.id, ...body, decisionDate: date(body.decisionDate) } });
      await tx.procurementRequest.update({ where: { id: request.id }, data: { finalDecision: body.decision, finalDecisionDate: date(body.decisionDate), status: body.decision === "APPROVED" ? "APPROVED" : body.decision === "REJECTED" ? "REJECTED" : request.status, lastUpdatedBy: body.decisionBy } });
      await logEvent(tx, request.id, `FINAL_${body.decision}`, body.decisionBy, request.finalDecision, body.decision);
      return decision;
    });
    res.json(result);
  } catch (e) { res.status(500).json({ error: "Failed to save decision" }); }
}

async function createAction(req, res) {
  if (!required(req.body.action)) return error(res, "Action is required");
  if (req.body.status && !ACTION_STATUSES.includes(req.body.status)) return error(res, "Action status is invalid");
  try {
    const action = await prisma.procurementAction.create({ data: { requestId: Number(req.params.id), reviewId: req.body.reviewId || null, action: req.body.action, owner: req.body.owner, dueDate: date(req.body.dueDate), status: req.body.status || "NOT_STARTED" } });
    res.status(201).json(action);
  } catch (e) { res.status(500).json({ error: "Failed to create action" }); }
}

async function updateAction(req, res) {
  try {
    if (req.body.status && !ACTION_STATUSES.includes(req.body.status)) return error(res, "Action status is invalid");
    const action = await prisma.procurementAction.update({ where: { id: Number(req.params.id) }, data: { ...req.body, dueDate: req.body.dueDate === undefined ? undefined : date(req.body.dueDate) } });
    res.json(action);
  } catch (e) { res.status(500).json({ error: "Failed to update action" }); }
}

async function getRiskReviews(req, res) {
  try {
    const reviews = await prisma.riskReview.findMany({ where: { request: { status: { not: "COMPLETED" } } }, include: { request: { select: { id: true, requestNumber: true, vendorName: true, categoryServiceType: true, status: true } } }, orderBy: [{ reviewStatus: "asc" }, { actionDueDate: "asc" }] });
    res.json(reviews.map((review) => ({ ...review, outstanding: outstanding(review) })));
  } catch (e) { res.status(500).json({ error: "Failed to fetch risk reviews" }); }
}

async function getDashboard(req, res) {
  try {
    const [requests, reviews, actions] = await Promise.all([prisma.procurementRequest.findMany({ include: { reviews: true } }), prisma.riskReview.findMany(), prisma.procurementAction.findMany()]);
    const today = new Date();
    res.json({ measures: { totalRequests: requests.length, draftRequests: requests.filter((r) => r.status === "DRAFT").length, openOrInProgress: requests.filter((r) => ["OPEN", "IN_PROGRESS"].includes(r.status)).length, clarificationRequired: reviews.filter((r) => r.reviewStatus === "CLARIFICATION_REQUIRED").length, awaitingResponses: reviews.filter((r) => r.reviewRequired === "YES" && ["SENT", "AWAITING_RESPONSE"].includes(r.reviewStatus)).length, rejectedReviews: reviews.filter((r) => r.outcome === "REJECTED").length, completeRequiredReviews: requests.filter((r) => r.reviews.filter((x) => x.reviewRequired === "YES").every((x) => x.reviewStatus === "RESPONDED" && x.outcome !== "PENDING" && x.outcome !== "REJECTED")).length, overdueActions: actions.filter((a) => a.dueDate && a.dueDate < today && !["COMPLETED", "CANCELLED"].includes(a.status)).length, readyForApproval: requests.filter((r) => r.reviews.filter((x) => x.reviewRequired === "YES").every((x) => x.reviewStatus === "RESPONDED" && x.outcome !== "PENDING" && x.outcome !== "REJECTED")).length, approved: requests.filter((r) => r.finalDecision === "APPROVED").length, rejected: requests.filter((r) => r.finalDecision === "REJECTED").length, onHold: requests.filter((r) => r.status === "ON_HOLD").length }, byFunction: RISK_FUNCTIONS.map((riskFunction) => ({ riskFunction, outstanding: reviews.filter((r) => r.riskFunction === riskFunction && outstanding(r)).length, completed: reviews.filter((r) => r.riskFunction === riskFunction && r.reviewStatus === "RESPONDED").length })), actionsByOwner: actions.reduce((result, action) => { const key = action.owner || "Unassigned"; result[key] = (result[key] || 0) + 1; return result; }, {}) });
  } catch (e) { res.status(500).json({ error: "Failed to build dashboard" }); }
}

function csvValue(value) { return `"${String(value == null ? "" : value).replaceAll('"', '""')}"`; }
async function exportRequests(req, res) {
  const requests = await prisma.procurementRequest.findMany({ include: { reviews: true, actions: true }, orderBy: { updatedAt: "desc" } });
  const rows = ["Request ID,Vendor Name,Category Service Type,Business Owner,Procurement Lead,Date Raised,Request Type,Risk Rating,Current Stage,Overall Status,Risk Review Progress,Final Decision,Current Action,Action Owner,Action Due Date,Target Go Live Date,Last Updated"];
  for (const request of requests) rows.push([request.requestNumber, request.vendorName, request.categoryServiceType, request.businessOwner || request.requestedBy, request.procurementLead, request.dateRaised, request.requestType, request.riskRating, request.currentStage, request.status, `${request.reviews.filter((r) => !outstanding(r)).length}/${request.reviews.length}`, request.finalDecision, request.currentAction, request.actionOwner, request.actionDueDate, request.targetGoLiveDate, request.updatedAt].map(csvValue).join(","));
  res.set("Content-Type", "text/csv"); res.set("Content-Disposition", "attachment; filename=request-register.csv"); res.send(rows.join("\n"));
}

async function getReferenceData(req, res) {
  try {
    const fields = PRESET_FIELDS;
    const defaults = { categoryServiceType: CATEGORIES, requestType: REQUEST_TYPES, riskRating: RISK_RATINGS, currentStage: STAGES };
    for (const [field, values] of Object.entries(defaults)) for (const value of values) await prisma.presetValue.upsert({ where: { fieldName_value: { fieldName: field, value } }, update: { value }, create: { fieldName: field, value } });
    const pastInputs = Object.fromEntries(await Promise.all(fields.map(async (field) => {
      const rows = await prisma.procurementRequest.findMany({ where: { [field]: { not: "" } }, select: { [field]: true }, distinct: [field], orderBy: { [field]: "asc" } });
      return [field, rows.map((row) => row[field]).filter(Boolean)];
    })));
    for (const field of fields) for (const value of pastInputs[field]) await prisma.presetValue.upsert({ where: { fieldName_value: { fieldName: field, value } }, update: { value }, create: { fieldName: field, value } });
    const presets = await prisma.presetValue.findMany({ orderBy: [{ fieldName: "asc" }, { active: "desc" }, { value: "asc" }] });
    res.json({ riskFunctions: RISK_FUNCTIONS, requestTypes: REQUEST_TYPES, categories: CATEGORIES, riskRatings: RISK_RATINGS, statuses: STATUSES, stages: STAGES, reviewStatuses: REVIEW_STATUSES, outcomes: OUTCOMES, actionStatuses: ACTION_STATUSES, decisions: DECISIONS, reasonCategories: REASON_CATEGORIES, outsourcingClassifications: ["YES", "NO", "TO_BE_DETERMINED", "NOT_APPLICABLE"], pastInputs, presets, presetFields: PRESET_FIELDS.map((fieldName) => ({ fieldName, label: PRESET_LABELS[fieldName] })) });
  } catch (e) { res.status(500).json({ error: "Failed to fetch reference data" }); }
}

async function getPresets(req, res) {
  try { res.json(await prisma.presetValue.findMany({ orderBy: [{ fieldName: "asc" }, { active: "desc" }, { value: "asc" }] })); } catch (e) { res.status(500).json({ error: "Failed to fetch presets" }); }
}

async function createPreset(req, res) {
  const { fieldName, value } = req.body;
  if (!PRESET_FIELDS.includes(fieldName) || !required(value)) return error(res, "A valid preset field and value are required");
  try { const preset = await prisma.presetValue.upsert({ where: { fieldName_value: { fieldName, value: String(value).trim() } }, update: { active: true }, create: { fieldName, value: String(value).trim() } }); res.status(201).json(preset); } catch (e) { res.status(500).json({ error: "Failed to create preset" }); }
}

async function updatePreset(req, res) {
  try { const preset = await prisma.presetValue.update({ where: { id: Number(req.params.id) }, data: { active: Boolean(req.body.active) } }); res.json(preset); } catch (e) { res.status(500).json({ error: "Failed to update preset" }); }
}

module.exports = { getRequests, getRequest, createRequest, updateRequest, deleteRequest, updateReview, saveDecision, createAction, updateAction, getRiskReviews, getDashboard, exportRequests, getReferenceData, getPresets, createPreset, updatePreset };
