import { useState, useEffect } from "react";
import api, { getErrorMessage } from "../../lib/api";
import styles from "./PatientJournal.module.css";

export default function PatientJournal() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showing, setShowing] = useState("list");
  const [form, setForm] = useState({
    entry_date: new Date().toISOString().split("T")[0],
    notes: "",
    mood: 3,
    symptoms: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    try {
      const { data } = await api.get("/journal");
      setEntries(data.entries);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/journal", form);
      setSuccess("Entry saved successfully.");
      setForm({
        entry_date: new Date().toISOString().split("T")[0],
        notes: "",
        mood: 3,
        symptoms: [],
      });
      setShowing("list");
      fetchEntries();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const moodLabels = {
    1: "Very poor",
    2: "Poor",
    3: "Okay",
    4: "Good",
    5: "Great",
  };

  if (loading) return <p className={styles.muted}>Loading journal...</p>;

  return (
    <div>
      <div className={styles.topRow}>
        <div>
          <h1 className={styles.heading}>Journal</h1>
          <p className={styles.subheading}>
            Track your symptoms and wellbeing daily.
          </p>
        </div>
        <button
          onClick={() => setShowing(showing === "list" ? "form" : "list")}
          className={styles.addButton}
        >
          {showing === "form" ? "Cancel" : "+ New Entry"}
        </button>
      </div>

      {success && <div className={styles.success}>{success}</div>}
      {error && <div className={styles.error}>{error}</div>}

      {showing === "form" && (
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>New Journal Entry</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Date</label>
              <input
                type="date"
                value={form.entry_date}
                onChange={(e) =>
                  setForm({ ...form, entry_date: e.target.value })
                }
                className={styles.input}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                How are you feeling? {moodLabels[form.mood]}
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={form.mood}
                onChange={(e) =>
                  setForm({ ...form, mood: parseInt(e.target.value) })
                }
                className={styles.slider}
              />
              <div className={styles.moodRow}>
                <span>Very poor</span>
                <span>Great</span>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className={styles.textarea}
                placeholder="How are you feeling today? Any symptoms to note?"
                rows={4}
              />
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save entry"}
            </button>
          </form>
        </div>
      )}

      {showing === "list" && (
        <div>
          {entries.length === 0 ? (
            <div className={styles.emptyCard}>
              <p>No journal entries yet.</p>
              <p className={styles.muted}>
                Use the button above to add your first entry.
              </p>
            </div>
          ) : (
            <div className={styles.list}>
              {entries.map((entry) => (
                <div key={entry.id} className={styles.entryCard}>
                  <div className={styles.entryTop}>
                    <span className={styles.entryDate}>
                      {new Date(entry.entry_date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <span className={styles.moodBadge}>
                      {moodLabels[entry.mood]}
                    </span>
                  </div>
                  {entry.notes && (
                    <p className={styles.entryNotes}>{entry.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
