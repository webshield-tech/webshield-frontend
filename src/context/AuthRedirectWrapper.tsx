import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
interface AuthRedirectWrapperProps {
  children: React.ReactNode;
}

const AuthRedirectWrapper: React.FC<AuthRedirectWrapperProps> = ({
  children,
}) => {
  const { user, loading, authChecked } = useAuth();
  const location = useLocation();
  if (loading || !authChecked) {
    return null;
  }
  if (
    !user &&
    location.pathname !== "/login" &&
    location.pathname !== "/signup" &&
    location.pathname !== "/"
  ) {
    return <Navigate to="/login" replace />;
  }
  if (user && !user.agreedToTerms && location.pathname !== "/disclaimer") {
    return <Navigate to="/disclaimer" replace />;
  }
  if (user?.agreedToTerms && location.pathname === "/disclaimer") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AuthRedirectWrapper;
