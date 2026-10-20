import { useState, useEffect } from "react";
import api from "../../lib/api";
import styles from "./SupervisorDashboard.module.css";

export default function SupervisorDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data } = await api.get("/supervisor/stats");
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return <p className={styles.muted}>Loading dashboard...</p>;

  return (
    <div>
      <h1 className={styles.heading}>Supervisor Dashboard</h1>
      <p className={styles.subheading}>System overview and analytics.</p>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{stats?.totalUsers || 0}</div>
          <div className={styles.statLabel}>Total users</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{stats?.totalPatients || 0}</div>
          <div className={styles.statLabel}>Patients</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{stats?.totalClinicians || 0}</div>
          <div className={styles.statLabel}>Clinicians</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>
            {stats?.totalSubmissions || 0}
          </div>
          <div className={styles.statLabel}>Total submissions</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{stats?.totalCases || 0}</div>
          <div className={styles.statLabel}>Total cases</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{stats?.openCases || 0}</div>
          <div className={styles.statLabel}>Open cases</div>
        </div>
      </div>
    </div>
  );
}
