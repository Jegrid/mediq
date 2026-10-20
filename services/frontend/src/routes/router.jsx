import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import LoginPage from "../features/auth/LoginPage";
import RegisterPage from "../features/auth/RegisterPage";

import PatientLayout from "../shared/layouts/PatientLayout";
import ClinicianLayout from "../shared/layouts/ClinicianLayout";
import SupervisorLayout from "../shared/layouts/SupervisorLayout";

import PatientDashboard from "../features/patient/PatientDashboard";
import SubmitSymptoms from "../features/patient/SubmitSymptoms";
import PatientHistory from "../features/patient/PatientHistory";
import PatientJournal from "../features/patient/PatientJournal";
import PatientProfile from "../features/patient/PatientProfile";
import SubmissionResult from "../features/patient/SubmissionResult";

import ClinicianDashboard from "../features/clinician/ClinicianDashboard";
import CaseList from "../features/clinician/CaseList";
import CaseDetail from "../features/clinician/CaseDetail";

import SupervisorDashboard from "../features/supervisor/SupervisorDashboard";
import UserManagement from "../features/supervisor/UserManagement";
import RedFlagRules from "../features/supervisor/RedFlagRules";
import AuditLog from "../features/supervisor/AuditLog";
import CaseAssignment from "../features/supervisor/CaseAssignment";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },

  {
    path: "/patient",
    element: (
      <ProtectedRoute allowedRoles={["patient"]}>
        <PatientLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <PatientDashboard /> },
      { path: "submit", element: <SubmitSymptoms /> },
      { path: "submit/result/:submissionId", element: <SubmissionResult /> },
      { path: "history", element: <PatientHistory /> },
      { path: "journal", element: <PatientJournal /> },
      { path: "profile", element: <PatientProfile /> },
    ],
  },

  {
    path: "/clinician",
    element: (
      <ProtectedRoute allowedRoles={["clinician"]}>
        <ClinicianLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <ClinicianDashboard /> },
      { path: "cases", element: <CaseList /> },
      { path: "cases/:caseId", element: <CaseDetail /> },
    ],
  },

  {
    path: "/supervisor",
    element: (
      <ProtectedRoute allowedRoles={["supervisor"]}>
        <SupervisorLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <SupervisorDashboard /> },
      { path: "users", element: <UserManagement /> },
      { path: "red-flags", element: <RedFlagRules /> },
      { path: "audit", element: <AuditLog /> },
      { path: "assign", element: <CaseAssignment /> },
    ],
  },
]);
