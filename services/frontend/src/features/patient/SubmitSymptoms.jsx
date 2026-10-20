import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../../lib/api";
import cx from "../../lib/cx";
import { tone, redFlagTone } from "../../shared/tones";
import styles from "./SubmitSymptoms.module.css";

export default function SubmitSymptoms() {
  const navigate = useNavigate();
  const [freeText, setFreeText] = useState("");
  const [symptoms, setSymptoms] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingSymptoms, setFetchingSymptoms] = useState(true);
  const [redFlags, setRedFlags] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSymptoms() {
      try {
        const { data } = await api.get("/submissions/symptoms");
        setSymptoms(data.symptoms);
      } catch (err) {
        console.error(err);
      } finally {
        setFetchingSymptoms(false);
      }
    }
    fetchSymptoms();
  }, []);

  function toggleSymptom(canonical_term) {
    setSelected((prev) =>
      prev.includes(canonical_term)
        ? prev.filter((s) => s !== canonical_term)
        : [...prev, canonical_term]
    );
  }

  const grouped = symptoms.reduce((acc, symptom) => {
    if (!acc[symptom.category]) acc[symptom.category] = [];
    acc[symptom.category].push(symptom);
    return acc;
  }, {});

  async function handleSubmit(e) {
    e.preventDefault();
    if (!freeText && selected.length === 0) {
      setError(
        "Please describe your symptoms or select at least one from the list."
      );
      return;
    }
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/submissions", {
        free_text: freeText,
        structured_symptoms: selected,
      });

      if (data.red_flags && data.red_flags.length > 0) {
        setRedFlags(data.red_flags);
        setTimeout(() => {
          navigate(`/patient/submit/result/${data.submission.id}`);
        }, 4000);
      } else {
        navigate(`/patient/submit/result/${data.submission.id}`);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (redFlags.length > 0) {
    return (
      <div className={styles.redFlagPage}>
        {redFlags.map((flag, i) => (
          <div
            key={i}
            className={cx(
              styles.redFlagBanner,
              tone(redFlagTone(flag.severity))
            )}
          >
            <div className={styles.redFlagTitle}>
              {flag.severity === "emergency" ? "Emergency" : "Urgent"}
            </div>
            <p className={styles.redFlagMessage}>{flag.message}</p>
          </div>
        ))}
        <p className={styles.redirectNote}>Redirecting to your results...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className={styles.heading}>Submit Symptoms</h1>
      <p className={styles.subheading}>
        Describe how you're feeling and select any matching symptoms below.
      </p>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className={styles.section}>
          <label className={styles.label}>Describe your symptoms</label>
          <textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            className={styles.textarea}
            placeholder="e.g. I've had a headache and felt nauseous since yesterday morning..."
            rows={4}
          />
        </div>

        <div className={styles.section}>
          <label className={styles.label}>
            Select matching symptoms and risk factors
            {selected.length > 0 && (
              <span className={styles.selectedCount}>
                {selected.length} selected
              </span>
            )}
          </label>

          {fetchingSymptoms ? (
            <p className={styles.muted}>Loading symptoms...</p>
          ) : (
            <div className={styles.symptomGroups}>
              {Object.entries(grouped).map(([category, items]) => {
                const isRisk = category === "Risk Factors";
                return (
                  <div
                    key={category}
                    className={cx(styles.group, isRisk && styles.riskGroup)}
                  >
                    <div
                      className={cx(
                        styles.groupTitle,
                        isRisk && styles.riskGroupTitle
                      )}
                    >
                      {isRisk ? "Risk Factors & Medical History" : category}
                    </div>
                    <div className={styles.symptomGrid}>
                      {items.map((symptom) => (
                        <button
                          key={symptom.canonical_term}
                          type="button"
                          onClick={() => toggleSymptom(symptom.canonical_term)}
                          className={cx(
                            styles.symptomChip,
                            isRisk && styles.riskChip,
                            selected.includes(symptom.canonical_term) &&
                              (isRisk
                                ? styles.riskChipActive
                                : styles.symptomChipActive)
                          )}
                        >
                          {symptom.name}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? "Analysing..." : "Submit for analysis"}
        </button>
      </form>
    </div>
  );
}
