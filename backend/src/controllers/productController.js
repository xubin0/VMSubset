const prisma = require("../lib/prisma");

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

const productInclude = {
  category: true,
  brand: true
};

async function getProducts(req, res) {
  try {
    const { q, categoryId, brandId, status } = req.query;
    const where = {};

    if (q) {
      const terms = q.trim().split(/\s+/).filter(Boolean);
      where.AND = terms.map((term) => ({
        OR: [
          { model: { contains: term, mode: "insensitive" } },
          { description: { contains: term, mode: "insensitive" } },
          { specification: { contains: term, mode: "insensitive" } }
        ]
      }));
    }

    if (categoryId) {
      const parsedCategoryId = parseId(categoryId);
      if (!parsedCategoryId) return res.status(400).json({ error: "Invalid categoryId" });
      where.categoryId = parsedCategoryId;
    }

    if (brandId) {
      const parsedBrandId = parseId(brandId);
      if (!parsedBrandId) return res.status(400).json({ error: "Invalid brandId" });
      where.brandId = parsedBrandId;
    }

    if (status) where.lifecycleStatus = status;

    const products = await prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: { model: "asc" }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
}

async function getProductById(req, res) {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid product id" });

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        ...productInclude,
        vendorProducts: {
          include: { vendor: true }
        },
        quotes: {
          include: { vendor: true, rfq: true },
          orderBy: { quoteDate: "desc" }
        },
        contractItems: {
          include: { contract: { include: { vendor: true } } }
        },
        purchaseOrderLines: {
          include: { purchaseOrder: { include: { vendor: true, contract: true } } }
        }
      }
    });

    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
}

async function createProduct(req, res) {
  const {
    categoryId,
    brandId,
    model,
    description,
    specification,
    lifecycleStatus,
    notes
  } = req.body;

  if (!model) return res.status(400).json({ error: "model is required" });

  try {
    const product = await prisma.product.create({
      data: {
        categoryId,
        brandId,
        model,
        description,
        specification,
        lifecycleStatus,
        notes
      },
      include: productInclude
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to create product" });
  }
}

module.exports = { getProducts, getProductById, createProduct };