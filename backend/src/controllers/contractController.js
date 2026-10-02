const prisma = require("../lib/prisma");

async function getContracts(req, res) {
  try {
    const where = req.query.department && req.query.department !== "Procurement"
      ? { procurementRequests: { some: { department: req.query.department } } }
      : {};
    const contracts = await prisma.contract.findMany({
      where,
      include: {
        vendor: true,
        items: { include: { product: true } },
        purchaseOrders: true
      },
      orderBy: { startDate: "desc" }
    });
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch contracts" });
  }
}

module.exports = { getContracts };