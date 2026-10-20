import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import cx from "../../lib/cx";
import { tone, caseStatusTone } from "../../shared/tones";
import styles from "./CaseList.module.css";

export default function CaseList() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

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

  const filtered =
    filter === "all" ? cases : cases.filter((c) => c.status === filter);

  if (loading) return <p className={styles.muted}>Loading cases...</p>;

  return (
    <div>
      <h1 className={styles.heading}>My Cases</h1>
      <p className={styles.subheading}>All cases assigned to you.</p>

      <div className={styles.filters}>
        {["all", "open", "in_review", "resolved", "referred"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cx(
              styles.filterButton,
              filter === f && styles.filterButtonActive
            )}
          >
            {f === "all" ? "All" : f.replace("_", " ")}
            <span className={styles.filterCount}>
              {f === "all"
                ? cases.length
                : cases.filter((c) => c.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className={styles.emptyCard}>
          <p>No cases found.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map((c) => {
            return (
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
                    ? c.free_text.slice(0, 120) +
                      (c.free_text.length > 120 ? "..." : "")
                    : "Structured symptoms only"}
                </p>
                <div className={styles.cardBottom}>
                  <span className={styles.date}>
                    Opened{" "}
                    {new Date(c.opened_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <button
                    onClick={() => navigate(`/clinician/cases/${c.id}`)}
                    className={styles.reviewButton}
                  >
                    Review
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
