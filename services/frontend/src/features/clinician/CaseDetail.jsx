import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../../lib/api";
import cx from "../../lib/cx";
import { tone, severityTone } from "../../shared/tones";
import styles from "./CaseDetail.module.css";

export default function CaseDetail() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    clinician_notes: "",
    clinician_decision: "",
    final_condition_id: "",
    status: "open",
  });

  useEffect(() => {
    async function fetchCase() {
      try {
        const [caseRes, conditionsRes] = await Promise.all([
          api.get(`/cases/${caseId}`),
          api.get("/conditions"),
        ]);
        setCaseData(caseRes.data.case);
        setPredictions(caseRes.data.predictions);
        setConditions(conditionsRes.data.conditions);
        setForm({
          clinician_notes: caseRes.data.case.clinician_notes || "",
          clinician_decision: caseRes.data.case.clinician_decision || "",
          final_condition_id: caseRes.data.case.final_condition_id || "",
          status: caseRes.data.case.status || "open",
        });
      } catch {
        setError("Could not load case.");
      } finally {
        setLoading(false);
      }
    }
    fetchCase();
  }, [caseId]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await api.put(`/cases/${caseId}`, form);
      setSuccess("Case updated successfully.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className={styles.muted}>Loading case...</p>;
  if (error && !caseData) return <p className={styles.error}>{error}</p>;

  const structuredSymptoms = Array.isArray(caseData.structured_symptoms)
    ? caseData.structured_symptoms
    : JSON.parse(caseData.structured_symptoms || "[]");

  return (
    <div>
      <button
        onClick={() => navigate("/clinician/cases")}
        className={styles.backButton}
      >
        Back to cases
      </button>

      <h1 className={styles.heading}>
        Case — {caseData.first_name} {caseData.last_name}
      </h1>
      <p className={styles.subheading}>
        Opened{" "}
        {new Date(caseData.opened_at).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      <div className={styles.grid}>
        <div className={styles.leftCol}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Patient Information</h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoField}>
                <span className={styles.infoLabel}>Name</span>
                <span className={styles.infoValue}>
                  {caseData.first_name} {caseData.last_name}
                </span>
              </div>
              <div className={styles.infoField}>
                <span className={styles.infoLabel}>Date of birth</span>
                <span className={styles.infoValue}>
                  {caseData.dob
                    ? new Date(caseData.dob).toLocaleDateString("en-GB")
                    : "—"}
                </span>
              </div>
              <div className={styles.infoField}>
                <span className={styles.infoLabel}>Sex</span>
                <span className={styles.infoValue}>
                  {caseData.sex === "M"
                    ? "Male"
                    : caseData.sex === "F"
                      ? "Female"
                      : "—"}
                </span>
              </div>
              <div className={styles.infoField}>
                <span className={styles.infoLabel}>Allergies</span>
                <span className={styles.infoValue}>
                  {caseData.allergies || "—"}
                </span>
              </div>
              <div className={styles.infoField}>
                <span className={styles.infoLabel}>Existing conditions</span>
                <span className={styles.infoValue}>
                  {caseData.existing_conditions || "—"}
                </span>
              </div>
              <div className={styles.infoField}>
                <span className={styles.infoLabel}>Medications</span>
                <span className={styles.infoValue}>
                  {caseData.medications || "—"}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Patient Submission</h2>
            {caseData.free_text && (
              <div className={styles.freeTextBlock}>
                <span className={styles.infoLabel}>Free text</span>
                <p className={styles.freeText}>{caseData.free_text}</p>
              </div>
            )}
            {caseData.structured_symptoms && structuredSymptoms.length > 0 && (
              <div>
                <span className={styles.infoLabel}>Selected symptoms</span>
                <div className={styles.symptomChips}>
                  {structuredSymptoms.map((symptom) => (
                    <span key={symptom} className={styles.symptomChip}>
                      {symptom.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {!caseData.free_text &&
              (!caseData.structured_symptoms ||
                structuredSymptoms.length === 0) && (
                <p className={styles.muted}>No symptoms recorded.</p>
              )}
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>AI Predictions</h2>
            <div className={styles.predictionList}>
              {predictions.length === 0 ? (
                <p className={styles.muted}>No predictions available.</p>
              ) : (
                predictions.map((pred) => {
                  return (
                    <div key={pred.id} className={styles.predictionRow}>
                      <div className={styles.predictionLeft}>
                        <span className={styles.predictionRank}>
                          #{pred.rank}
                        </span>
                        <span className={styles.predictionName}>
                          {pred.condition_name}
                        </span>
                      </div>
                      <div className={styles.predictionRight}>
                        <span
                          className={cx(
                            styles.severityBadge,
                            tone(severityTone[pred.severity_tier], "warning")
                          )}
                        >
                          {pred.severity_tier}
                        </span>
                        <span className={styles.confidence}>
                          {Math.round(pred.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className={styles.rightCol}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Clinician Review</h2>

            {success && <div className={styles.success}>{success}</div>}
            {error && <div className={styles.errorBox}>{error}</div>}

            <form onSubmit={handleSave} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Status</label>
                <select
                  className={styles.input}
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="open">Open</option>
                  <option value="in_review">In review</option>
                  <option value="resolved">Resolved</option>
                  <option value="referred">Referred</option>
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Decision</label>
                <select
                  className={styles.input}
                  value={form.clinician_decision}
                  onChange={(e) =>
                    setForm({ ...form, clinician_decision: e.target.value })
                  }
                >
                  <option value="">No decision yet</option>
                  <option value="confirm_ai">Confirm AI prediction</option>
                  <option value="override">Override AI prediction</option>
                  <option value="inconclusive">Inconclusive</option>
                </select>
              </div>

              {form.clinician_decision === "override" && (
                <div className={styles.field}>
                  <label className={styles.label}>Final condition</label>
                  <select
                    className={styles.input}
                    value={form.final_condition_id}
                    onChange={(e) =>
                      setForm({ ...form, final_condition_id: e.target.value })
                    }
                  >
                    <option value="">Select condition</option>
                    {conditions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className={styles.field}>
                <label className={styles.label}>Notes</label>
                <textarea
                  className={styles.textarea}
                  value={form.clinician_notes}
                  onChange={(e) =>
                    setForm({ ...form, clinician_notes: e.target.value })
                  }
                  rows={6}
                  placeholder="Add your clinical notes here..."
                />
              </div>

              <button
                type="submit"
                className={styles.saveButton}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save review"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
