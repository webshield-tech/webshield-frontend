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
import AuthRedirectWrapper from "../context/AuthRedirectWrapper";

function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthRedirectWrapper> {/* Add this wrapper */}
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute requireAuth={false}>
                <Landing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={
              <ProtectedRoute requireAuth={false}>
                <Login />
              </ProtectedRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <ProtectedRoute requireAuth={false}>
                <Signup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <ProtectedRoute requireAuth={false}>
                <ForgotPassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <ProtectedRoute requireAuth={false}>
                <ResetPassword />
              </ProtectedRoute>
            }
          />

          <Route
            path="/disclaimer"
            element={
              <ProtectedRoute>
                <Disclaimer />
              </ProtectedRoute>
            }
          />

          {/* User app routes (protected) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/start-scan"
            element={
              <ProtectedRoute>
                <StartScan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scan-progress/:scanId"
            element={
              <ProtectedRoute>
                <ScanProgress />
            </ProtectedRoute>
            }
          />
          <Route
            path="/scan-result/:scanId"
            element={
              <ProtectedRoute>
                <ScanResult />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scan-history"
            element={
              <ProtectedRoute>
                <ScanHistory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/about-tools"
            element={
              <ProtectedRoute>
                <AboutTools />
              </ProtectedRoute>
            }
          />

          {/* Admin protected route */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route index element={<AdminDashboard />} />
            <Route path="scans" element={<AdminScans />} />
            <Route path="users" element={<AdminUsers />} />
            {/* user history deep link handled by AdminUsers page */}
            <Route path="users/:userId/history" element={<AdminUsers />} />
          </Route>

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthRedirectWrapper>
    </BrowserRouter>
  );
}

export default AppRoutes;