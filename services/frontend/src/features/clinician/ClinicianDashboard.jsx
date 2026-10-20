import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import cx from "../../lib/cx";
import { tone, caseStatusTone } from "../../shared/tones";
import styles from "./ClinicianDashboard.module.css";

export default function ClinicianDashboard() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCases() {
      try {
        const { data } = await api.get("/cases");
        setCases(data.cases);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCases();
  }, []);

  const open = cases.filter(
    (c) => c.status === "open" || c.status === "in_review"
  );
  const resolved = cases.filter(
    (c) => c.status === "resolved" || c.status === "referred"
  );

  return (
    <div>
      <h1 className={styles.heading}>Clinician Dashboard</h1>
      <p className={styles.subheading}>
        Welcome back. Here's an overview of your cases.
      </p>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{open.length}</div>
          <div className={styles.statLabel}>Open cases</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{resolved.length}</div>
          <div className={styles.statLabel}>Resolved cases</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{cases.length}</div>
          <div className={styles.statLabel}>Total cases</div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Open Cases</h2>
          <button
            onClick={() => navigate("/clinician/cases")}
            className={styles.viewAll}
          >
            View all
          </button>
        </div>

        {loading ? (
          <p className={styles.muted}>Loading...</p>
        ) : open.length === 0 ? (
          <div className={styles.emptyCard}>
            <p>No open cases assigned to you.</p>
          </div>
        ) : (
          <div className={styles.list}>
            {open.slice(0, 5).map((c) => (
              <div key={c.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <span className={styles.patientName}>
                    {c.first_name} {c.last_name}
                  </span>
                  <span
                    className={cx(styles.badge, tone(caseStatusTone[c.status]))}
                  >
                    {c.status.replace("_", " ")}
                  </span>
                </div>
                <p className={styles.preview}>
                  {c.free_text
                    ? c.free_text.slice(0, 100) + "..."
                    : "Structured symptoms only"}
                </p>
                <div className={styles.cardBottom}>
                  <span className={styles.date}>
                    {new Date(c.opened_at).toLocaleDateString("en-GB")}
                  </span>
                  <button
                    onClick={() => navigate(`/clinician/cases/${c.id}`)}
                    className={styles.reviewButton}
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
