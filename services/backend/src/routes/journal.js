const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const authorise = require("../middleware/authorise");
const db = require("../db");

router.get("/", authenticate, authorise("patient"), async (req, res, next) => {
  try {
    const entries = await db("journal_entries")
      .where({ patient_id: req.user.id })
      .orderBy("entry_date", "desc");
    res.json({ entries });
  } catch (err) {
    next(err);
  }
});

router.post("/", authenticate, authorise("patient"), async (req, res, next) => {
  try {
    const { entry_date, notes, mood, symptoms } = req.body;
    if (!entry_date) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Entry date is required.",
        },
      });
    }
    const [entry] = await db("journal_entries")
      .insert({
        patient_id: req.user.id,
        entry_date,
        notes,
        mood,
        symptoms: JSON.stringify(symptoms || []),
      })
      .returning("*");
    res.status(201).json({ entry });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
