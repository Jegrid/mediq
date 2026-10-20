import AppLayout from "./AppLayout";

const navItems = [
  { path: "/supervisor", label: "Dashboard", exact: true },
  { path: "/supervisor/users", label: "User Management" },
  { path: "/supervisor/red-flags", label: "Red Flag Rules" },
  { path: "/supervisor/audit", label: "Audit Log" },
  { path: "/supervisor/assign", label: "Assign Cases" },
];

export default function SupervisorLayout() {
  return <AppLayout role="supervisor" navItems={navItems} />;
}
