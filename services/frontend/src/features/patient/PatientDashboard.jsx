import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import cx from "../../lib/cx";
import { tone, submissionTone } from "../../shared/tones";
import styles from "./PatientDashboard.module.css";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubmissions() {
      try {
        const { data } = await api.get("/submissions");
        setSubmissions(data.submissions.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSubmissions();
  }, []);

  return (
    <div>
      <h1 className={styles.heading}>Welcome back</h1>
      <p className={styles.subheading}>How are you feeling today?</p>

      <button
        onClick={() => navigate("/patient/submit")}
        className={styles.submitButton}
      >
        + Submit Symptoms
      </button>

      <h2 className={styles.sectionTitle}>Recent Submissions</h2>

      {loading ? (
        <p className={styles.muted}>Loading...</p>
      ) : submissions.length === 0 ? (
        <div className={styles.emptyCard}>
          <p>You haven't submitted any symptoms yet.</p>
          <p className={styles.muted}>Use the button above to get started.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {submissions.map((sub) => (
            <div key={sub.id} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.cardDate}>
                  {new Date(sub.submitted_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span
                  className={cx(styles.badge, tone(submissionTone(sub.status)))}
                >
                  {sub.status}
                </span>
              </div>
              <p className={styles.cardText}>
                {sub.free_text
                  ? sub.free_text.slice(0, 100) +
                    (sub.free_text.length > 100 ? "..." : "")
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
