const express = require("express");
const router = express.Router();
const { getServiceRecommendations } = require("../controllers/recommendationsController");

// Get service recommendations for a vehicle
router.get("/vehicle/:vehicle_id", getServiceRecommendations);

module.exports = router;

