import AppLayout from "./AppLayout";

const navItems = [
  { path: "/patient", label: "Dashboard", exact: true },
  { path: "/patient/submit", label: "Submit Symptoms" },
  { path: "/patient/history", label: "My History" },
  { path: "/patient/journal", label: "Journal" },
  { path: "/patient/profile", label: "Profile" },
];

export default function PatientLayout() {
  return <AppLayout role="patient" navItems={navItems} />;
}
