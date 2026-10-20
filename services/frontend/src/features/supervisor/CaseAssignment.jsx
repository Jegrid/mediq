import { useState, useEffect } from "react";
import api, { getErrorMessage } from "../../lib/api";
import styles from "./CaseAssignment.module.css";

export default function CaseAssignment() {
  const [submissions, setSubmissions] = useState([]);
  const [clinicians, setClinicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [assigning, setAssigning] = useState(null);
  const [selected, setSelected] = useState({});
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [subsRes, usersRes] = await Promise.all([
          api.get("/supervisor/submissions"),
          api.get("/supervisor/users"),
        ]);
        setSubmissions(subsRes.data.submissions);
        setClinicians(
          usersRes.data.users.filter(
            (u) => u.role === "clinician" && u.is_active
          )
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleAssign(submissionId) {
    const clinicianId = selected[submissionId];
    if (!clinicianId) {
      setError("Please select a clinician first.");
      return;
    }

    setAssigning(submissionId);
    setError("");
    setSuccess("");

    try {
      await api.post("/supervisor/cases", {
        submission_id: submissionId,
        assigned_clinician_id: clinicianId,
      });
      setSuccess("Case assigned successfully.");
      setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setAssigning(null);
    }
  }

  if (loading) return <p className={styles.muted}>Loading...</p>;

  //group the submisison by patient
  const patients = submissions.reduce((acc, sub) => {
    const key = sub.patient_id;
    if (!acc[key]) {
      acc[key] = {
        patient_id: key,
        first_name: sub.first_name,
        last_name: sub.last_name,
        submissions: [],
      };
    }
    acc[key].submissions.push(sub);
    return acc;
  }, {});

  const patientList = Object.values(patients);

  //on patient selcet show the submissions
  if (selectedPatient) {
    const patient = patients[selectedPatient];

    if (!patient) {
      setSelectedPatient(null);
      return null;
    }

    const patientSubmissions = patient?.submissions || [];

    return (
      <div>
        <button
          onClick={() => {
            setSelectedPatient(null);
            setSuccess("");
            setError("");
          }}
          className={styles.backButton}
        >
          Back to patients
        </button>

        <h1 className={styles.heading}>
          {patient.first_name} {patient.last_name}
        </h1>
        <p className={styles.subheading}>
          {patientSubmissions.length} unassigned submission
          {patientSubmissions.length !== 1 ? "s" : ""}
        </p>

        {success && <div className={styles.success}>{success}</div>}
        {error && <div className={styles.error}>{error}</div>}

        {patientSubmissions.length === 0 ? (
          <div className={styles.emptyCard}>
            <p>No unassigned submissions for this patient.</p>
          </div>
        ) : (
          <div className={styles.list}>
            {patientSubmissions.map((sub) => (
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
                  <span className={styles.badge}>{sub.status}</span>
                </div>

                <p className={styles.preview}>
                  {sub.free_text
                    ? sub.free_text.slice(0, 150) +
                      (sub.free_text.length > 150 ? "..." : "")
                    : "Structured symptoms only"}
                </p>

                <div className={styles.assignRow}>
                  <select
                    className={styles.select}
                    value={selected[sub.id] || ""}
                    onChange={(e) =>
                      setSelected({ ...selected, [sub.id]: e.target.value })
                    }
                  >
                    <option value="">Select clinician</option>
                    {clinicians.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.first_name} {c.last_name} — {c.email}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleAssign(sub.id)}
                    className={styles.assignButton}
                    disabled={assigning === sub.id}
                  >
                    {assigning === sub.id ? "Assigning..." : "Assign"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  //list of patients
  return (
    <div>
      <h1 className={styles.heading}>Assign Cases</h1>
      <p className={styles.subheading}>
        Select a patient to view and assign their submissions.
      </p>

      {patientList.length === 0 ? (
        <div className={styles.emptyCard}>
          <p>No unassigned submissions.</p>
          <p className={styles.muted}>
            All submissions have been assigned to clinicians.
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {patientList.map((patient) => (
            <div
              key={patient.patient_id}
              className={styles.patientCard}
              onClick={() => setSelectedPatient(patient.patient_id)}
            >
              <div className={styles.patientInfo}>
                <span className={styles.patientName}>
                  {patient.first_name} {patient.last_name}
                </span>
                <span className={styles.submissionCount}>
                  {patient.submissions.length} unassigned submission
                  {patient.submissions.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
