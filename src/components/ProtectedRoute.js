import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();
  const hasRequiredRole =
    !allowedRoles || !user || allowedRoles.includes(user.user_type);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      toast.error("Vous devez etre connecte pour acceder a cette page.");
    }
  }, [loading, isAuthenticated]);

  useEffect(() => {
    if (!loading && isAuthenticated && !hasRequiredRole) {
      toast.error("Vous n'avez pas les droits pour acceder a cette page.");
    }
  }, [loading, isAuthenticated, hasRequiredRole]);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "5rem" }}>
        <div className="spinner"></div> Chargement...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRequiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
