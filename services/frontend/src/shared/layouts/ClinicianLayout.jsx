import AppLayout from "./AppLayout";

const navItems = [
  { path: "/clinician", label: "Dashboard", exact: true },
  { path: "/clinician/cases", label: "My Cases" },
];

export default function ClinicianLayout() {
  return <AppLayout role="clinician" navItems={navItems} />;
}
