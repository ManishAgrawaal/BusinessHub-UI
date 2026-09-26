import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
  role?: "Admin" | "Client";
}

export default function ProtectedRoute({
  children,
  role,
}: ProtectedRouteProps) {
  const token =
    localStorage.getItem("mts_token") ||
    sessionStorage.getItem("mts_token");

  const userData =
    localStorage.getItem("mts_user") ||
    sessionStorage.getItem("mts_user");

  // No token → login
  if (!token) {
    if (role === "Admin") {
      return <Navigate to="/admin-login" replace />;
    }

    return <Navigate to="/client-login" replace />;
  }

  // No user information
  if (!userData) {
    if (role === "Admin") {
      return <Navigate to="/admin-login" replace />;
    }

    return <Navigate to="/client-login" replace />;
  }

  try {
    const user = JSON.parse(userData);

    // Role validation
    if (role && user.role !== role) {
      if (user.role === "Admin") {
        return (
          <Navigate
            to="/admin-dashboard"
            replace
          />
        );
      }

      if (user.role === "Client") {
        return (
          <Navigate
            to="/client-dashboard"
            replace
          />
        );
      }

      return <Navigate to="/" replace />;
    }

    return <>{children}</>;
  } catch {
    localStorage.removeItem("mts_token");
    localStorage.removeItem("mts_user");

    sessionStorage.removeItem("mts_token");
    sessionStorage.removeItem("mts_user");

    if (role === "Admin") {
      return <Navigate to="/admin-login" replace />;
    }

    return <Navigate to="/client-login" replace />;
  }
}