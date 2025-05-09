import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (!user && !loading) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (
    roles.length > 0 &&
    !roles.some((role) => user?.roles?.some((r) => r.name === role))
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
