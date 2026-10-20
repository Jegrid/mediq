import { useState, useEffect } from "react";
import api, { getErrorMessage } from "../../lib/api";
import styles from "./PatientProfile.module.css";

export default function PatientProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data } = await api.get("/patients/profile");
        setProfile(data.profile);
        setForm(data.profile);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const { data } = await api.put("/patients/profile", form);
      setProfile(data.profile);
      setSuccess("Profile updated successfully.");
      setEditing(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className={styles.muted}>Loading profile...</p>;

  return (
    <div>
      <div className={styles.topRow}>
        <div>
          <h1 className={styles.heading}>My Profile</h1>
          <p className={styles.subheading}>
            Your personal and medical information.
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(!editing);
            setSuccess("");
            setError("");
          }}
          className={editing ? styles.cancelButton : styles.editButton}
        >
          {editing ? "Cancel" : "Edit profile"}
        </button>
      </div>

      {success && <div className={styles.success}>{success}</div>}
      {error && <div className={styles.error}>{error}</div>}

      {editing ? (
        <form onSubmit={handleSave} className={styles.form}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Personal Details</h2>
            <div className={styles.grid}>
              <div className={styles.field}>
                <label className={styles.label}>First name</label>
                <input
                  className={styles.input}
                  value={form.first_name || ""}
                  onChange={(e) =>
                    setForm({ ...form, first_name: e.target.value })
                  }
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Last name</label>
                <input
                  className={styles.input}
                  value={form.last_name || ""}
                  onChange={(e) =>
                    setForm({ ...form, last_name: e.target.value })
                  }
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Date of birth</label>
                <input
                  type="date"
                  className={styles.input}
                  value={form.dob ? form.dob.split("T")[0] : ""}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Sex</label>
                <select
                  className={styles.input}
                  value={form.sex || ""}
                  onChange={(e) => setForm({ ...form, sex: e.target.value })}
                >
                  <option value="">Prefer not to say</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Medical Information</h2>
            <div className={styles.field}>
              <label className={styles.label}>Allergies</label>
              <textarea
                className={styles.textarea}
                value={form.allergies || ""}
                onChange={(e) =>
                  setForm({ ...form, allergies: e.target.value })
                }
                rows={2}
                placeholder="e.g. Penicillin, nuts"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Existing conditions</label>
              <textarea
                className={styles.textarea}
                value={form.existing_conditions || ""}
                onChange={(e) =>
                  setForm({ ...form, existing_conditions: e.target.value })
                }
                rows={2}
                placeholder="e.g. Asthma, Type 2 diabetes"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Current medications</label>
              <textarea
                className={styles.textarea}
                value={form.medications || ""}
                onChange={(e) =>
                  setForm({ ...form, medications: e.target.value })
                }
                rows={2}
                placeholder="e.g. Salbutamol inhaler, Metformin 500mg"
              />
            </div>
          </div>

          <button type="submit" className={styles.saveButton} disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      ) : (
        <div>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Personal Details</h2>
            <div className={styles.grid}>
              <div className={styles.infoField}>
                <span className={styles.infoLabel}>First name</span>
                <span className={styles.infoValue}>
                  {profile?.first_name || "—"}
                </span>
              </div>
              <div className={styles.infoField}>
                <span className={styles.infoLabel}>Last name</span>
                <span className={styles.infoValue}>
                  {profile?.last_name || "—"}
                </span>
              </div>
              <div className={styles.infoField}>
                <span className={styles.infoLabel}>Date of birth</span>
                <span className={styles.infoValue}>
                  {profile?.dob
                    ? new Date(profile.dob).toLocaleDateString("en-GB")
                    : "—"}
                </span>
              </div>
              <div className={styles.infoField}>
                <span className={styles.infoLabel}>Sex</span>
                <span className={styles.infoValue}>
                  {profile?.sex === "M"
                    ? "Male"
                    : profile?.sex === "F"
                      ? "Female"
                      : profile?.sex === "O"
                        ? "Other"
                        : "—"}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Medical Information</h2>
            <div className={styles.infoField}>
              <span className={styles.infoLabel}>Allergies</span>
              <span className={styles.infoValue}>
                {profile?.allergies || "—"}
              </span>
            </div>
            <div className={styles.infoField}>
              <span className={styles.infoLabel}>Existing conditions</span>
              <span className={styles.infoValue}>
                {profile?.existing_conditions || "—"}
              </span>
            </div>
            <div className={styles.infoField}>
              <span className={styles.infoLabel}>Current medications</span>
              <span className={styles.infoValue}>
                {profile?.medications || "—"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
