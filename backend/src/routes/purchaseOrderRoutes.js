const express = require("express");
const { getPurchaseOrders } = require("../controllers/purchaseOrderController");

const router = express.Router();

router.get("/", getPurchaseOrders);

module.exports = router;