const db = require("../db");
const { getPredictions } = require("../lib/mlClient");
const { checkRedFlags } = require("../lib/redFlagChecker");
const audit = require("../lib/audit");

//
async function createSubmission(req, res, next) {
  try {
    const { free_text, structured_symptoms = [] } = req.body;
    const patientId = req.user.id;

    if (!free_text && structured_symptoms.length === 0) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message:
            "Please provide symptoms either as text or by selecting from the list.",
        },
      });
    }

    const redFlags = await checkRedFlags(free_text, structured_symptoms);

    const [submission] = await db("submissions")
      .insert({
        patient_id: patientId,
        free_text,
        structured_symptoms: JSON.stringify(structured_symptoms),
        status: "pending",
      })
      .returning("*");

    await audit.log(
      patientId,
      "SUBMISSION_CREATED",
      "submission",
      submission.id
    );

    let predictions = [];
    try {
      const mlResponse = await getPredictions({
        freeText: free_text,
        structuredSymptoms: structured_symptoms,
      });

      const conditionNames = mlResponse.predictions.map(
        (p) => p.condition_name
      );
      const conditions = await db("conditions").whereIn("name", conditionNames);
      console.log("Condition names from ML:", conditionNames);
      console.log("Conditions found in DB:", conditions);
      const conditionMap = {};
      for (const c of conditions) conditionMap[c.name] = c.id;

      const predictionRows = mlResponse.predictions.map((p) => ({
        submission_id: submission.id,
        condition_id: conditionMap[p.condition_name] || null,
        confidence: p.confidence,
        rank: p.rank,
        matched_symptoms: JSON.stringify(p.matched_symptoms),
        model_version: mlResponse.model_version,
        explanation: p.explanation,
      }));

      const inserted = await db("predictions")
        .insert(predictionRows)
        .returning("*");

      await db("submissions")
        .where({ id: submission.id })
        .update({ status: "predicted" });
      submission.status = "predicted";

      predictions = inserted.map((p) => ({
        ...p,
        condition_name: mlResponse.predictions.find((mp) => mp.rank === p.rank)
          ?.condition_name,
      }));
    } catch (mlErr) {
      console.error("ML service error:", mlErr.message);
    }

    res.status(201).json({ submission, predictions, red_flags: redFlags });
  } catch (err) {
    next(err);
  }
}

async function getSubmissions(req, res, next) {
  try {
    const submissions = await db("submissions")
      .where({ patient_id: req.user.id })
      .orderBy("submitted_at", "desc");

    res.json({ submissions });
  } catch (err) {
    next(err);
  }
}

async function getSubmission(req, res, next) {
  try {
    //find submission bt id
    const submission = await db("submissions")
      .where({ id: req.params.id })
      .first();

    //return 404 if not exists
    if (!submission) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Submission not found" },
      });
    }

    //allow only the owniong patient or clinician & supervsior to view
    if (
      submission.patient_id !== req.user.id &&
      !["clinician", "supervisor"].includes(req.user.role)
    ) {
      return res.status(403).json({
        error: { code: "FORBIDDEN", message: "Access denied" },
      });
    }

    //fetch the predictions joined with the condition details
    const predictions = await db("predictions")
      .join("conditions", "predictions.condition_id", "conditions.id")
      .where({ submission_id: submission.id })
      .select(
        "predictions.*",
        "conditions.name as condition_name",
        "conditions.severity_tier"
      )
      .orderBy("rank");

    //fetch the case and clinician descion if there is one
    const caseRecord = await db("cases")
      .leftJoin(
        "conditions as final_cond",
        "cases.final_condition_id",
        "final_cond.id"
      )
      .where({ submission_id: submission.id })
      .select(
        "cases.id",
        "cases.status",
        "cases.clinician_decision",
        "cases.clinician_notes",
        "cases.resolved_at",
        "final_cond.name as final_condition_name",
        "final_cond.severity_tier as final_condition_severity"
      )
      .first();

    res.json({ submission, predictions, case: caseRecord || null });
  } catch (err) {
    next(err);
  }
}

module.exports = { createSubmission, getSubmissions, getSubmission };
