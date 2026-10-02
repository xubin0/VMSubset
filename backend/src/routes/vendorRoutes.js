const express = require("express");
const {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor
} = require("../controllers/vendorController");

const router = express.Router();

router.get("/", getVendors);
router.get("/:id", getVendorById);
router.post("/", createVendor);
router.put("/:id", updateVendor);
router.delete("/:id", deleteVendor);

module.exports = router;