import { Navigate } from "react-router-dom";
import { useAuthStore } from "../lib/authStore";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, token } = useAuthStore();
  if (!token || !user || !allowedRoles.includes(user.role))
    return <Navigate to="/login" replace />;
  return children;
}
