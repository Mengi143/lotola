// src/components/ProtectedRoute.tsx
import type { JSX } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: JSX.Element;
  role: string | null;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role, allowedRoles }) => {
  if (!role) return <Navigate to="/auth" replace />;
  if (!allowedRoles.includes(role)) return <Navigate to="/dashboard" replace />;
  return children;
};

export default ProtectedRoute;
