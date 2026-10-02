const express = require("express");
const {
  getRfqs,
  getRfqById,
  createRfq
} = require("../controllers/rfqController");

const router = express.Router();

router.get("/", getRfqs);
router.get("/:id", getRfqById);
router.post("/", createRfq);

module.exports = router;