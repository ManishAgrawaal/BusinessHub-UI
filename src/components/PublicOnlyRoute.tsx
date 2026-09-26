import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface PublicOnlyRouteProps {
  children: ReactNode;
  role: "Client" | "Admin";
}

export default function PublicOnlyRoute({
  children,
  role,
}: PublicOnlyRouteProps) {
  const token =
    localStorage.getItem("mts_token") ||
    sessionStorage.getItem("mts_token");

  const userData =
    localStorage.getItem("mts_user") ||
    sessionStorage.getItem("mts_user");

  // No active session → allow login page
  if (!token || !userData) {
    return <>{children}</>;
  }

  try {
    const user = JSON.parse(userData);

    // Already logged-in user with correct role
    if (user.role === role) {
      if (role === "Client") {
        return <Navigate to="/client-dashboard" replace />;
      }

      if (role === "Admin") {
        return <Navigate to="/admin-dashboard" replace />;
      }
    }

    // Logged-in user has a different role
    if (user.role === "Admin") {
      return <Navigate to="/admin-dashboard" replace />;
    }

    if (user.role === "Client") {
      return <Navigate to="/client-dashboard" replace />;
    }

    return <>{children}</>;
  } catch {
    // Invalid user data → clear session
    localStorage.removeItem("mts_token");
    localStorage.removeItem("mts_user");

    sessionStorage.removeItem("mts_token");
    sessionStorage.removeItem("mts_user");

    return <>{children}</>;
  }
}