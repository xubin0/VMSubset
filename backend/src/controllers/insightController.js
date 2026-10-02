const prisma = require("../lib/prisma");

function annualize(value, frequency) {
  const amount = Number(value || 0);
  if (frequency === "MONTHLY") return amount * 12;
  if (frequency === "QUARTERLY") return amount * 4;
  return amount;
}

async function getDashboardSummary(req, res) {
  try {
    const department = req.query.department;
    if (department && department !== "Procurement") {
      const requests = await prisma.procurementRequest.findMany({ where: { department } });
      return res.json({
        view: "TEAM",
        department,
        counts: {
          requests: requests.length,
          openRequests: requests.filter((request) => request.status === "OPEN").length,
          inProgressRequests: requests.filter((request) => request.status === "IN_PROGRESS").length,
          completedRequests: requests.filter((request) => request.status === "COMPLETED").length
        },
        costs: null,
        expiringContracts: []
      });
    }

    const now = new Date();
    const ninetyDays = new Date(now);
    ninetyDays.setDate(ninetyDays.getDate() + 90);
    const [vendorCount, productCount, rfqCount, contracts, purchaseOrders] = await Promise.all([
      prisma.vendor.count({ where: { status: "ACTIVE" } }),
      prisma.product.count(),
      prisma.rFQ.count({ where: { status: { not: "CLOSED" } } }),
      prisma.contract.findMany({ include: { vendor: true, items: true } }),
      prisma.purchaseOrder.findMany({ orderBy: { poDate: "desc" }, take: 50 })
    ]);

    const activeContracts = contracts.filter((contract) => contract.status === "ACTIVE" && contract.endDate >= now);
    const annualCommittedCost = activeContracts.reduce((total, contract) => total + annualize(contract.totalValue, contract.billingFrequency), 0);
    const actualPurchaseOrderSpend = purchaseOrders.reduce((total, purchaseOrder) => total + Number(purchaseOrder.totalAmount || 0), 0);
    const expiringContracts = activeContracts.filter((contract) => contract.endDate <= ninetyDays).map((contract) => ({
      id: contract.id,
      contractNumber: contract.contractNumber,
      vendorName: contract.vendor.vendorName,
      endDate: contract.endDate,
      renewalNoticeDays: contract.renewalNoticeDays
    }));

    res.json({
      view: "PROCUREMENT",
      counts: { vendors: vendorCount, products: productCount, rfqs: rfqCount, contracts: contracts.length },
      costs: {
        monthlyCommitted: annualCommittedCost / 12,
        quarterlyCommitted: annualCommittedCost / 4,
        annualCommitted: annualCommittedCost,
        purchaseOrderSpend: actualPurchaseOrderSpend
      },
      expiringContracts
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to calculate dashboard summary" });
  }
}

async function searchAll(req, res) {
  const query = String(req.query.q || "").trim();
  if (!query) return res.status(400).json({ error: "q is required" });

  try {
    const terms = query.split(/\s+/).filter(Boolean);
    const contains = (term) => ({ contains: term, mode: "insensitive" });
    const matching = (fields) => ({ AND: terms.map((term) => ({ OR: fields.map((field) => ({ [field]: contains(term) })) })) });
    const [products, vendors, contracts, rfqs, purchaseOrders] = await Promise.all([
      prisma.product.findMany({ where: matching(["model", "description", "specification"]), include: { brand: true, category: true }, take: 8 }),
      prisma.vendor.findMany({ where: matching(["vendorName", "vendorType", "country"]), take: 8 }),
      prisma.contract.findMany({ where: { AND: terms.map((term) => ({ OR: [{ contractNumber: contains(term) }, { vendor: { vendorName: contains(term) } }, { items: { some: { product: { OR: [{ model: contains(term) }, { description: contains(term) }] } } } }] })) }, include: { vendor: true }, take: 8 }),
      prisma.rFQ.findMany({ where: { AND: terms.map((term) => ({ OR: [{ rfqNumber: contains(term) }, { requestedBy: contains(term) }, { businessJustification: contains(term) }, { items: { some: { product: { OR: [{ model: contains(term) }, { description: contains(term) }] } } } }] })) }, take: 8 }),
      prisma.purchaseOrder.findMany({ where: { AND: terms.map((term) => ({ OR: [{ requestedBy: contains(term) }, { status: contains(term) }, { notes: contains(term) }, { vendor: { vendorName: contains(term) } }, { lines: { some: { product: { OR: [{ model: contains(term) }, { description: contains(term) }] } } } }] })) }, include: { vendor: true }, take: 8 })
    ]);
    res.json({ products, vendors, contracts, rfqs, purchaseOrders });
  } catch (error) {
    res.status(500).json({ error: "Failed to search procurement records" });
  }
}

module.exports = { getDashboardSummary, searchAll };