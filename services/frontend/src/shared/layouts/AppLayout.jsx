import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../lib/authStore";
import cx from "../../lib/cx";
import styles from "./AppLayout.module.css";

export default function AppLayout({ role, navItems }) {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  function handleLogout() {
    clearAuth();
    navigate("/login");
  }

  return (
    <div className={cx(styles.shell, styles[role])}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>MedIQ</div>
        <div className={styles.userInfo}>
          <div className={styles.userEmail}>{user?.email}</div>
          <div className={styles.userRole}>{role}</div>
        </div>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                cx(styles.navItem, isActive && styles.navItemActive)
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button onClick={handleLogout} className={styles.logout}>
          Sign out
        </button>
      </aside>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
