import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../lib/authStore";
import cx from "../../lib/cx";
import styles from "./AppLayout.module.css";

export default function AppLayout({ role, navItems }) {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  //only used on mobile, where the sidebar becomes a top bar with a menu button
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    clearAuth();
    navigate("/login");
  }

  return (
    <div className={cx(styles.shell, styles[role])}>
      <aside className={styles.sidebar}>
        <div className={styles.topBar}>
          <div className={styles.brand}>MedIQ</div>
          <button
            className={styles.menuButton}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="app-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
        <div
          id="app-menu"
          className={cx(styles.menu, menuOpen && styles.menuOpen)}
        >
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
                onClick={() => setMenuOpen(false)}
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
        </div>
      </aside>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
