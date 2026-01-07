import { useAuth } from "../../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  adminOnly = false,
}) => {
  const { user } = useAuth();

  if (adminOnly && user?.role !== "admin") {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
