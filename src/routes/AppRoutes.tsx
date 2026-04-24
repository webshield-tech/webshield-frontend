import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminRoute from "../routes/AdminRoutes";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminScans from "../pages/admin/AdminScan";
import AdminUsers from "../pages/admin/AdminUser";
import Landing from "../pages/public/Landing";
import Login from "../pages/public/Login";
import Signup from "../pages/public/Signup";
import Disclaimer from "../pages/public/Disclaimer";
import Dashboard from "../pages/user/Dashboard";
import Profile from "../pages/user/Profile";
import ForgotPassword from "../pages/public/ForgotPassword";
import ResetPassword from "../pages/public/ResetPassword";
import ScanHistory from "../pages/user/ScanHistory";
import ScanProgress from "../pages/user/ScanProgress";
import ScanResult from "../pages/user/ScanResult";
import ProtectedRoute from "../components/common/ProtectedRoute";
import StartScan from "../pages/user/StartScan";
import AboutTools from "../pages/user/AboutTools";
import { useAuth } from "../context/AuthContext"; 
import LoadingScreen from "../components/common/LoadingScreen";
import NotFound from "../pages/public/NotFound";
import MainLayout from "../components/layout/MainLayout";

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Disclaimer - special handling: needs auth but blocks access to other pages */}
        <Route 
          path="/disclaimer" 
          element={
            <ProtectedRoute>
              {user?.agreedToTerms ? <Navigate to="/dashboard" replace /> : <Disclaimer />}
            </ProtectedRoute>
          } 
        />

        {/* Main Application Area (Protected) */}
        <Route 
          element={
            <ProtectedRoute>
              {user?.agreedToTerms ? <MainLayout /> : <Navigate to="/disclaimer" replace />}
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/start-scan" element={<StartScan />} />
          <Route path="/scan-history" element={<ScanHistory />} />
          <Route path="/scan-progress/:scanId" element={<ScanProgress />} />
          <Route path="/scan-result/:scanId" element={<ScanResult />} />
          <Route path="/about-tools" element={<AboutTools />} />
        </Route>

        {/* Admin Section (Protected + AdminOnly) */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute adminOnly>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="scans" element={<AdminScans />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:userId/history" element={<AdminUsers />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
