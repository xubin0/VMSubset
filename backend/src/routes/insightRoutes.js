const express = require("express");
const { getDashboardSummary, searchAll } = require("../controllers/insightController");

const router = express.Router();

router.get("/summary", getDashboardSummary);
router.get("/search", searchAll);

module.exports = router;