const prisma = require("../lib/prisma");

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function getRfqs(req, res) {
  try {
    const where = req.query.department && req.query.department !== "Procurement"
      ? { procurementRequests: { some: { department: req.query.department } } }
      : {};
    const rfqs = await prisma.rFQ.findMany({
      where,
      include: {
        category: true,
        items: { include: { product: true } },
        vendors: { include: { vendor: true } }
      },
      orderBy: { requestDate: "desc" }
    });
    res.json(rfqs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch RFQs" });
  }
}

async function getRfqById(req, res) {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid RFQ id" });

  try {
    const rfq = await prisma.rFQ.findUnique({
      where: { id },
      include: {
        category: true,
        items: { include: { product: true, quotes: true } },
        vendors: { include: { vendor: true } },
        quotes: { include: { vendor: true, product: true, rfqItem: true } }
      }
    });

    if (!rfq) return res.status(404).json({ error: "RFQ not found" });
    res.json(rfq);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch RFQ" });
  }
}

async function createRfq(req, res) {
  const {
    rfqNumber,
    requestedBy,
    categoryId,
    status,
    closingDate,
    businessJustification,
    items = [],
    vendorIds = []
  } = req.body;

  if (!rfqNumber || !requestedBy || !status) {
    return res.status(400).json({
      error: "rfqNumber, requestedBy, and status are required"
    });
  }

  if (!Array.isArray(items) || !Array.isArray(vendorIds)) {
    return res.status(400).json({ error: "items and vendorIds must be arrays" });
  }

  try {
    const rfq = await prisma.rFQ.create({
      data: {
        rfqNumber,
        requestedBy,
        categoryId,
        status,
        closingDate,
        businessJustification,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            targetDeliveryDate: item.targetDeliveryDate,
            notes: item.notes
          }))
        },
        vendors: {
          create: vendorIds.map((vendorId) => ({
            vendorId,
            responseStatus: "PENDING"
          }))
        }
      },
      include: {
        items: { include: { product: true } },
        vendors: { include: { vendor: true } }
      }
    });
    res.status(201).json(rfq);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "rfqNumber already exists" });
    }
    res.status(500).json({ error: "Failed to create RFQ" });
  }
}

module.exports = { getRfqs, getRfqById, createRfq };