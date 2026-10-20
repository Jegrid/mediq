const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const authorise = require("../middleware/authorise");
const db = require("../db");

router.get(
  "/profile",
  authenticate,
  authorise("patient"),
  async (req, res, next) => {
    try {
      const profile = await db("patient_profiles")
        .where({ user_id: req.user.id })
        .first();
      res.json({ profile });
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  "/profile",
  authenticate,
  authorise("patient"),
  async (req, res, next) => {
    try {
      const {
        first_name,
        last_name,
        dob,
        sex,
        allergies,
        existing_conditions,
        medications,
      } = req.body;
      const [profile] = await db("patient_profiles")
        .where({ user_id: req.user.id })
        .update({
          first_name,
          last_name,
          dob,
          sex,
          allergies,
          existing_conditions,
          medications,
          updated_at: new Date(),
        })
        .returning("*");
      res.json({ profile });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
