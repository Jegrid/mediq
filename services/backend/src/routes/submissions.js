const express = require("express");
const router = express.Router();
const {
  createSubmission,
  getSubmissions,
  getSubmission,
} = require("../controllers/submissionController");
const authenticate = require("../middleware/authenticate");
const authorise = require("../middleware/authorise");
const db = require("../db");

router.get("/symptoms", authenticate, async (req, res, next) => {
  try {
    const symptoms = await db("symptoms")
      //make sure risk factors prints first
      .orderByRaw("CASE WHEN category = 'Risk Factors' THEN 0 ELSE 1 END")
      .orderBy("category")
      .orderBy("name");
    res.json({ symptoms });
  } catch (err) {
    next(err);
  }
});

router.post("/", authenticate, authorise("patient"), createSubmission);
router.get("/", authenticate, authorise("patient"), getSubmissions);
router.get("/:id", authenticate, getSubmission);

module.exports = router;
