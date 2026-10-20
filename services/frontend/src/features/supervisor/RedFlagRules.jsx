import { useState, useEffect } from "react";
import api, { getErrorMessage } from "../../lib/api";
import cx from "../../lib/cx";
import { tone, redFlagTone } from "../../shared/tones";
import styles from "./RedFlagRules.module.css";

export default function RedFlagRules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showing, setShowing] = useState("list");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    symptom_keyword: "",
    message: "",
    severity: "urgent",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRules();
  }, []);

  async function fetchRules() {
    try {
      const { data } = await api.get("/supervisor/red-flags");
      setRules(data.rules);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/supervisor/red-flags", form);
      setSuccess("Rule created successfully.");
      setForm({ symptom_keyword: "", message: "", severity: "urgent" });
      setShowing("list");
      fetchRules();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggle(id) {
    try {
      const { data } = await api.put(`/supervisor/red-flags/${id}/toggle`);
      setRules(
        rules.map((r) =>
          r.id === id ? { ...r, is_active: data.rule.is_active } : r
        )
      );
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <p className={styles.muted}>Loading rules...</p>;

  return (
    <div>
      <div className={styles.topRow}>
        <div>
          <h1 className={styles.heading}>Red Flag Rules</h1>
          <p className={styles.subheading}>
            Manage keywords that trigger emergency warnings.
          </p>
        </div>
        <button
          onClick={() => {
            setShowing(showing === "form" ? "list" : "form");
            setError("");
            setSuccess("");
          }}
          className={styles.addButton}
        >
          {showing === "form" ? "Cancel" : "+ New Rule"}
        </button>
      </div>

      {success && <div className={styles.success}>{success}</div>}
      {error && <div className={styles.error}>{error}</div>}

      {showing === "form" && (
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>Create New Rule</h2>
          <form onSubmit={handleCreate} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Keyword</label>
              <input
                className={styles.input}
                value={form.symptom_keyword}
                onChange={(e) =>
                  setForm({ ...form, symptom_keyword: e.target.value })
                }
                placeholder="e.g. chest pain"
                required
              />
              <span className={styles.hint}>
                The word or phrase to detect in patient submissions.
              </span>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Warning message</label>
              <textarea
                className={styles.textarea}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="e.g. Chest pain can indicate a serious cardiac event. Call 999 immediately."
                rows={3}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Severity</label>
              <select
                className={styles.input}
                value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value })}
              >
                <option value="urgent">Urgent</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Create rule"}
            </button>
          </form>
        </div>
      )}

      <div className={styles.list}>
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={cx(
              styles.ruleCard,
              !rule.is_active && styles.ruleCardInactive
            )}
          >
            <div className={styles.ruleTop}>
              <div className={styles.ruleLeft}>
                <span
                  className={cx(
                    styles.severityBadge,
                    tone(redFlagTone(rule.severity))
                  )}
                >
                  {rule.severity === "emergency" ? "Emergency" : "Urgent"}
                </span>
                <span className={styles.keyword}>"{rule.symptom_keyword}"</span>
              </div>
              <div className={styles.ruleActions}>
                <span
                  className={cx(
                    styles.activeBadge,
                    tone(rule.is_active ? "success" : "muted")
                  )}
                >
                  {rule.is_active ? "Active" : "Inactive"}
                </span>
                <button
                  onClick={() => handleToggle(rule.id)}
                  className={cx(
                    styles.toggleButton,
                    tone(rule.is_active ? "danger" : "success")
                  )}
                >
                  {rule.is_active ? "Disable" : "Enable"}
                </button>
              </div>
            </div>
            <p className={styles.ruleMessage}>{rule.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
