import { useAuth } from "../../context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import LoadingScreen from "./LoadingScreen";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  adminOnly = false,
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const role = String(user?.role || "").trim().toLowerCase();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    const hasSessionHint = localStorage.getItem("ws_has_session");
    const redirectUrl = hasSessionHint ? "/login?session=expired" : "/login";
    if (hasSessionHint) {
      localStorage.removeItem("ws_has_session");
    }
    // Redirect to login but save the current location
    return <Navigate to={redirectUrl} state={{ from: location }} replace />;
  }

  if (adminOnly && role !== "admin" && role !== "superadmin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
