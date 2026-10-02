const express = require("express");
const cors = require("cors");
const vendorRoutes = require("./routes/vendorRoutes");
const productRoutes = require("./routes/productRoutes");
const rfqRoutes = require("./routes/rfqRoutes");
const contractRoutes = require("./routes/contractRoutes");
const purchaseOrderRoutes = require("./routes/purchaseOrderRoutes");
const insightRoutes = require("./routes/insightRoutes");
const procurementRequestRoutes = require("./routes/procurementRequestRoutes");
const workflowRoutes = require("./routes/workflowRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Vendor Management API is running"
  });
});

app.use("/api/vendors", vendorRoutes);
app.use("/api/products", productRoutes);
app.use("/api/rfqs", rfqRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api", insightRoutes);
app.use("/api/procurement-requests", procurementRequestRoutes);
app.use("/api", workflowRoutes);

module.exports = app;