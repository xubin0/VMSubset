const express = require("express");
const { getContracts } = require("../controllers/contractController");

const router = express.Router();

router.get("/", getContracts);

module.exports = router;