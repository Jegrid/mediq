const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const authorise = require("../middleware/authorise");
const db = require("../db");
const audit = require("../lib/audit");

//clinician access ot case list
router.get(
  "/",
  authenticate,
  authorise("clinician"),
  async (req, res, next) => {
    try {
      const cases = await db("cases")
        .join("submissions", "cases.submission_id", "submissions.id")
        .join(
          "patient_profiles",
          "submissions.patient_id",
          "patient_profiles.user_id"
        )
        .where("cases.assigned_clinician_id", req.user.id)
        .select(
          "cases.*",
          "submissions.free_text",
          "submissions.submitted_at",
          "submissions.patient_id",
          "patient_profiles.first_name",
          "patient_profiles.last_name"
        )
        .orderBy("cases.opened_at", "desc");
      res.json({ cases });
    } catch (err) {
      next(err);
    }
  }
);

//clinician access to case
router.get(
  "/:id",
  authenticate,
  authorise("clinician"),
  async (req, res, next) => {
    try {
      const caseRecord = await db("cases")
        .join("submissions", "cases.submission_id", "submissions.id")
        .join(
          "patient_profiles",
          "submissions.patient_id",
          "patient_profiles.user_id"
        )
        .where("cases.id", req.params.id)
        .select(
          "cases.*",
          "submissions.free_text",
          "submissions.structured_symptoms",
          "submissions.submitted_at",
          "submissions.patient_id",
          "patient_profiles.first_name",
          "patient_profiles.last_name",
          "patient_profiles.dob",
          "patient_profiles.sex",
          "patient_profiles.allergies",
          "patient_profiles.existing_conditions",
          "patient_profiles.medications"
        )
        .first();

      if (!caseRecord) {
        return res
          .status(404)
          .json({ error: { code: "NOT_FOUND", message: "Case not found" } });
      }

      const predictions = await db("predictions")
        .leftJoin("conditions", "predictions.condition_id", "conditions.id")
        .where({ submission_id: caseRecord.submission_id })
        .select(
          "predictions.*",
          "conditions.name as condition_name",
          "conditions.severity_tier"
        )
        .orderBy("rank");

      res.json({ case: caseRecord, predictions });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/",
  authenticate,
  authorise("supervisor"),
  async (req, res, next) => {
    try {
      const { submission_id, assigned_clinician_id } = req.body;
      const [newCase] = await db("cases")
        .insert({
          submission_id,
          assigned_clinician_id,
          status: "open",
        })
        .returning("*");
      res.status(201).json({ case: newCase });
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  "/:id",
  authenticate,
  authorise("clinician"),
  async (req, res, next) => {
    try {
      const {
        clinician_notes,
        clinician_decision,
        final_condition_id,
        status,
      } = req.body;

      const updates = {
        clinician_notes,
        clinician_decision,
        final_condition_id: final_condition_id || null,
        status,
      };

      if (status === "resolved") {
        updates.resolved_at = new Date();
      }

      const [updated] = await db("cases")
        .where({ id: req.params.id })
        .update(updates)
        .returning("*");

      await audit.log(req.user.id, "CASE_UPDATED", "case", req.params.id, {
        status,
        clinician_decision,
      });

      res.json({ case: updated });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
