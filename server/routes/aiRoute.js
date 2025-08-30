// server/routes/aiRoutes.js
const express = require("express");
const { getAIReview, getAIBatchReviews } = require("../controllers/aiController");
const router = express.Router();

router.post("/review", getAIReview);
router.post("/reviews/batch", getAIBatchReviews);

module.exports = router;
