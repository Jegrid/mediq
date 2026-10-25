import { useState, useEffect } from "react";
import api, { getErrorMessage } from "../../lib/api";
import cx from "../../lib/cx";
import { tone, roleTone } from "../../shared/tones";
import styles from "./UserManagement.module.css";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showing, setShowing] = useState("list");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "clinician",
    first_name: "",
    last_name: "",
    specialty: "",
    license_number: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const { data } = await api.get("/supervisor/users");
      setUsers(data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/supervisor/users", form);
      setSuccess("User created successfully.");
      setForm({
        email: "",
        password: "",
        role: "clinician",
        first_name: "",
        last_name: "",
        specialty: "",
        license_number: "",
      });
      setShowing("list");
      fetchUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggle(userId) {
    try {
      const { data } = await api.put(`/supervisor/users/${userId}/toggle`);
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, is_active: data.user.is_active } : u
        )
      );
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <p className={styles.muted}>Loading users...</p>;

  return (
    <div>
      <div className={styles.topRow}>
        <div>
          <h1 className={styles.heading}>User Management</h1>
          <p className={styles.subheading}>Manage all system users.</p>
        </div>
        <button
          onClick={() => {
            setShowing(showing === "form" ? "list" : "form");
            setError("");
            setSuccess("");
          }}
          className={styles.addButton}
        >
          {showing === "form" ? "Cancel" : "+ New User"}
        </button>
      </div>

      {success && <div className={styles.success}>{success}</div>}
      {error && <div className={styles.error}>{error}</div>}

      {showing === "form" && (
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>Create New User</h2>
          <form onSubmit={handleCreate} className={styles.form}>
            <div className={styles.grid}>
              <div className={styles.field}>
                <label className={styles.label}>First name</label>
                <input
                  className={styles.input}
                  value={form.first_name}
                  onChange={(e) =>
                    setForm({ ...form, first_name: e.target.value })
                  }
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Last name</label>
                <input
                  className={styles.input}
                  value={form.last_name}
                  onChange={(e) =>
                    setForm({ ...form, last_name: e.target.value })
                  }
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input
                  type="email"
                  className={styles.input}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Password</label>
                <input
                  type="password"
                  className={styles.input}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Role</label>
                <select
                  className={styles.input}
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="clinician">Clinician</option>
                  <option value="patient">Patient</option>
                </select>
              </div>
            </div>

            {form.role === "clinician" && (
              <div className={styles.grid}>
                <div className={styles.field}>
                  <label className={styles.label}>Specialty</label>
                  <input
                    className={styles.input}
                    value={form.specialty}
                    onChange={(e) =>
                      setForm({ ...form, specialty: e.target.value })
                    }
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>License number</label>
                  <input
                    className={styles.input}
                    value={form.license_number}
                    onChange={(e) =>
                      setForm({ ...form, license_number: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Create user"}
            </button>
          </form>
        </div>
      )}

      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <span>User</span>
          <span>Role</span>
          <span>Status</span>
          <span className={styles.actionsHeader}>Actions</span>
        </div>
        {users.map((user) => {
          const name =
            user.first_name && user.last_name
              ? `${user.first_name} ${user.last_name}`
              : null;
          //initials from the name, or the first letter of the email if there isn't one
          const initials = name
            ? `${user.first_name[0]}${user.last_name[0]}`
            : user.email[0];
          return (
            <div key={user.id} className={styles.tableRow}>
              <div className={styles.userCell}>
                <span
                  className={cx(
                    styles.avatar,
                    tone(roleTone[user.role], "info")
                  )}
                >
                  {initials}
                </span>
                <div>
                  <div className={cx(styles.userName, !name && styles.noName)}>
                    {name || "No name"}
                  </div>
                  <div className={styles.userEmail}>{user.email}</div>
                </div>
              </div>
              <span
                className={cx(
                  styles.roleBadge,
                  tone(roleTone[user.role], "info")
                )}
              >
                {user.role}
              </span>
              <span
                className={cx(
                  styles.status,
                  tone(user.is_active ? "success" : "danger")
                )}
              >
                {user.is_active ? "Active" : "Disabled"}
              </span>
              <button
                onClick={() => handleToggle(user.id)}
                className={cx(
                  styles.toggleButton,
                  tone(user.is_active ? "danger" : "success")
                )}
              >
                {user.is_active ? "Disable" : "Enable"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
