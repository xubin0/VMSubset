const express = require("express");
const controller = require("../controllers/workflowController");

const router = express.Router();

router.get("/reference-data", controller.getReferenceData);
router.get("/presets", controller.getPresets);
router.post("/presets", controller.createPreset);
router.patch("/presets/:id", controller.updatePreset);
router.get("/dashboard", controller.getDashboard);
router.get("/risk-reviews", controller.getRiskReviews);
router.get("/requests/export", controller.exportRequests);
router.get("/requests", controller.getRequests);
router.post("/requests", controller.createRequest);
router.get("/requests/:id", controller.getRequest);
router.patch("/requests/:id", controller.updateRequest);
router.delete("/requests/:id", controller.deleteRequest);
router.patch("/reviews/:id", controller.updateReview);
router.post("/requests/:id/decision", controller.saveDecision);
router.post("/requests/:id/actions", controller.createAction);
router.patch("/actions/:id", controller.updateAction);

module.exports = router;
