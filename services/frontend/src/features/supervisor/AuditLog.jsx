import { useState, useEffect } from "react";
import api from "../../lib/api";
import styles from "./AuditLog.module.css";

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const { data } = await api.get("/supervisor/audit");
        setLogs(data.logs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  if (loading) return <p className={styles.muted}>Loading audit log...</p>;

  return (
    <div>
      <h1 className={styles.heading}>Audit Log</h1>
      <p className={styles.subheading}>
        A read-only record of all system actions.
      </p>

      {logs.length === 0 ? (
        <div className={styles.emptyCard}>
          <p>No audit entries yet.</p>
          <p className={styles.muted}>
            System actions will appear here as they occur.
          </p>
        </div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span>Timestamp</span>
            <span>Action</span>
            <span>Entity</span>
            <span>User</span>
          </div>
          {logs.map((log) => (
            <div key={log.id} className={styles.tableRow}>
              <span className={styles.timestamp}>
                {new Date(log.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span className={styles.action}>{log.action}</span>
              <span className={styles.entity}>
                {log.entity_type ? `${log.entity_type}` : "—"}
              </span>
              <span className={styles.userId}>
                {log.user_email || "System"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
