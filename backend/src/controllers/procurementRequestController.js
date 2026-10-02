const prisma = require("../lib/prisma");

const requestInclude = {
  rfq: { include: { items: { include: { product: true } }, vendors: { include: { vendor: true } } } },
  contract: { include: { vendor: true } }
};

async function getRequests(req, res) {
  try {
    const department = req.query.department;
    if (!department) return res.status(400).json({ error: "department is required" });
    const where = department !== "Procurement" ? { department } : {};
    const requests = await prisma.procurementRequest.findMany({
      where,
      include: requestInclude,
      orderBy: { submittedAt: "desc" }
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch procurement requests" });
  }
}

async function createRequest(req, res) {
  const {
    department,
    requestedBy,
    purpose,
    businessNeed,
    budgeted,
    costCenter,
    notes
  } = req.body;

  if (!department || !requestedBy || !purpose || !businessNeed || budgeted === undefined || !costCenter) {
    return res.status(400).json({ error: "department, requestedBy, purpose, businessNeed, budgeted, and costCenter are required" });
  }

  try {
    const count = await prisma.procurementRequest.count();
    const requestNumber = `PR-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;
    const request = await prisma.procurementRequest.create({
      data: { requestNumber, department, requestedBy, purpose, businessNeed, budgeted: Boolean(budgeted), costCenter, notes },
      include: requestInclude
    });
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ error: "Failed to create procurement request" });
  }
}

module.exports = { getRequests, createRequest };