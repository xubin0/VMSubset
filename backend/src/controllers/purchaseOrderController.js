const prisma = require("../lib/prisma");

async function getPurchaseOrders(req, res) {
  try {
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      include: {
        vendor: true,
        contract: true,
        lines: { include: { product: true } }
      },
      orderBy: { poDate: "desc" }
    });
    res.json(purchaseOrders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch purchase orders" });
  }
}

module.exports = { getPurchaseOrders };