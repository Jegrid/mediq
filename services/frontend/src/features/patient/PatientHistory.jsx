import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import cx from "../../lib/cx";
import { tone, submissionTone } from "../../shared/tones";
import styles from "./PatientHistory.module.css";

export default function PatientHistory() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const { data } = await api.get("/submissions");
        setSubmissions(data.submissions);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  if (loading) return <p className={styles.muted}>Loading history...</p>;

  return (
    <div>
      <h1 className={styles.heading}>My History</h1>
      <p className={styles.subheading}>
        All your previous symptom submissions.
      </p>

      {submissions.length === 0 ? (
        <div className={styles.emptyCard}>
          <p>No submissions yet.</p>
          <p className={styles.muted}>
            Your submission history will appear here.
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {submissions.map((sub) => (
            <div key={sub.id} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.date}>
                  {new Date(sub.submitted_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span
                  className={cx(styles.badge, tone(submissionTone(sub.status)))}
                >
                  {sub.status}
                </span>
              </div>

              <p className={styles.preview}>
                {sub.free_text
                  ? sub.free_text.slice(0, 120) +
                    (sub.free_text.length > 120 ? "..." : "")
                  : "Structured symptoms only"}
              </p>

              <button
                onClick={() => navigate(`/patient/submit/result/${sub.id}`)}
                className={styles.viewButton}
              >
                View results
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
