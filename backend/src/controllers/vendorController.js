const prisma = require("../lib/prisma");

const vendorFields = [
  "vendorName",
  "vendorType",
  "status",
  "country",
  "website",
  "riskRating",
  "paymentTerms",
  "currency",
  "taxId",
  "erpVendorCode",
  "onboardingDate"
];

function getVendorData(body) {
  return Object.fromEntries(
    vendorFields
      .filter((field) => body[field] !== undefined)
      .map((field) => [field, body[field]])
  );
}

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function getVendors(req, res) {
  try {
    const vendors = await prisma.vendor.findMany({
      orderBy: { vendorName: "asc" }
    });
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch vendors" });
  }
}

async function getVendorById(req, res) {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid vendor id" });

  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        contacts: true,
        vendorProducts: { include: { product: true } },
        contracts: true
      }
    });

    if (!vendor) return res.status(404).json({ error: "Vendor not found" });
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch vendor" });
  }
}

async function createVendor(req, res) {
  try {
    const data = getVendorData(req.body);
    if (!data.vendorName) {
      return res.status(400).json({ error: "vendorName is required" });
    }

    const vendor = await prisma.vendor.create({ data });
    res.status(201).json(vendor);
  } catch (error) {
    res.status(500).json({ error: "Failed to create vendor" });
  }
}

async function updateVendor(req, res) {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid vendor id" });

  try {
    const vendor = await prisma.vendor.update({
      where: { id },
      data: getVendorData(req.body)
    });
    res.json(vendor);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Vendor not found" });
    }
    res.status(500).json({ error: "Failed to update vendor" });
  }
}

async function deleteVendor(req, res) {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid vendor id" });

  try {
    await prisma.vendor.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Vendor not found" });
    }
    res.status(500).json({ error: "Failed to delete vendor" });
  }
}

module.exports = {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor
};