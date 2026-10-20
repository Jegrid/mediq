const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const authorise = require("../middleware/authorise");
const db = require("../db");

router.get(
  "/stats",
  authenticate,
  authorise("supervisor"),
  async (req, res, next) => {
    try {
      const [totalUsers] = await db("users").count("id as count");
      const [totalPatients] = await db("users")
        .where({ role: "patient" })
        .count("id as count");
      const [totalClinicians] = await db("users")
        .where({ role: "clinician" })
        .count("id as count");
      const [totalSubmissions] = await db("submissions").count("id as count");
      const [totalCases] = await db("cases").count("id as count");
      const [openCases] = await db("cases")
        .whereIn("status", ["open", "in_review"])
        .count("id as count");

      res.json({
        totalUsers: parseInt(totalUsers.count),
        totalPatients: parseInt(totalPatients.count),
        totalClinicians: parseInt(totalClinicians.count),
        totalSubmissions: parseInt(totalSubmissions.count),
        totalCases: parseInt(totalCases.count),
        openCases: parseInt(openCases.count),
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/users",
  authenticate,
  authorise("supervisor"),
  async (req, res, next) => {
    try {
      const users = await db("users")
        .leftJoin("patient_profiles", function () {
          this.on("users.id", "patient_profiles.user_id").andOn(
            "users.role",
            db.raw("'patient'")
          );
        })
        .leftJoin("clinician_profiles", function () {
          this.on("users.id", "clinician_profiles.user_id").andOn(
            "users.role",
            db.raw("'clinician'")
          );
        })
        .select(
          "users.id",
          "users.email",
          "users.role",
          "users.is_active",
          "users.created_at",
          db.raw(
            "COALESCE(patient_profiles.first_name, clinician_profiles.first_name) as first_name"
          ),
          db.raw(
            "COALESCE(patient_profiles.last_name, clinician_profiles.last_name) as last_name"
          )
        )
        .orderBy("users.created_at", "desc");
      res.json({ users });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/users",
  authenticate,
  authorise("supervisor"),
  async (req, res, next) => {
    try {
      const bcrypt = require("bcryptjs");
      const {
        email,
        password,
        role,
        first_name,
        last_name,
        specialty,
        license_number,
      } = req.body;

      const existing = await db("users").where({ email }).first();
      if (existing) {
        return res.status(409).json({
          error: { code: "CONFLICT", message: "Email already in use." },
        });
      }

      const password_hash = await bcrypt.hash(password, 10);
      const [user] = await db("users")
        .insert({ email, password_hash, role })
        .returning("*");

      if (role === "clinician") {
        await db("clinician_profiles").insert({
          user_id: user.id,
          first_name,
          last_name,
          specialty,
          license_number,
        });
      } else if (role === "patient") {
        await db("patient_profiles").insert({
          user_id: user.id,
          first_name,
          last_name,
        });
      }

      res.status(201).json({ user });
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  "/users/:id/toggle",
  authenticate,
  authorise("supervisor"),
  async (req, res, next) => {
    try {
      const user = await db("users").where({ id: req.params.id }).first();
      if (!user)
        return res
          .status(404)
          .json({ error: { code: "NOT_FOUND", message: "User not found." } });

      const [updated] = await db("users")
        .where({ id: req.params.id })
        .update({ is_active: !user.is_active })
        .returning("*");

      res.json({ user: updated });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/cases",
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

router.get(
  "/red-flags",
  authenticate,
  authorise("supervisor"),
  async (req, res, next) => {
    try {
      const rules = await db("red_flag_rules").orderBy("created_at", "desc");
      res.json({ rules });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/red-flags",
  authenticate,
  authorise("supervisor"),
  async (req, res, next) => {
    try {
      const { symptom_keyword, message, severity } = req.body;
      if (!symptom_keyword || !message || !severity) {
        return res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "All fields are required.",
          },
        });
      }
      const [rule] = await db("red_flag_rules")
        .insert({
          symptom_keyword,
          message,
          severity,
        })
        .returning("*");
      res.status(201).json({ rule });
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  "/red-flags/:id/toggle",
  authenticate,
  authorise("supervisor"),
  async (req, res, next) => {
    try {
      const rule = await db("red_flag_rules")
        .where({ id: req.params.id })
        .first();
      if (!rule)
        return res
          .status(404)
          .json({ error: { code: "NOT_FOUND", message: "Rule not found." } });
      const [updated] = await db("red_flag_rules")
        .where({ id: req.params.id })
        .update({ is_active: !rule.is_active })
        .returning("*");
      res.json({ rule: updated });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/audit",
  authenticate,
  authorise("supervisor"),
  async (req, res, next) => {
    try {
      const logs = await db("audit_log")
        .leftJoin("users", "audit_log.user_id", "users.id")
        .select("audit_log.*", "users.email as user_email")
        .orderBy("audit_log.created_at", "desc")
        .limit(200);
      res.json({ logs });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/submissions",
  authenticate,
  authorise("supervisor"),
  async (req, res, next) => {
    try {
      const submissions = await db("submissions")
        .join(
          "patient_profiles",
          "submissions.patient_id",
          "patient_profiles.user_id"
        )
        .leftJoin("cases", "submissions.id", "cases.submission_id")
        .whereNull("cases.id")
        .select(
          "submissions.*",
          "patient_profiles.first_name",
          "patient_profiles.last_name"
        )
        .orderBy("submissions.submitted_at", "desc");
      res.json({ submissions });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
