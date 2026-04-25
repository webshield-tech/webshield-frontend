import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import AdminRoute from "../routes/AdminRoutes";
import ProtectedRoute from "../components/common/ProtectedRoute";
import { useAuth } from "../context/AuthContext"; 
import LoadingScreen from "../components/common/LoadingScreen";
import MainLayout from "../components/layout/MainLayout";

// Lazy-loaded components
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const AdminScans = lazy(() => import("../pages/admin/AdminScan"));
const AdminUsers = lazy(() => import("../pages/admin/AdminUser"));
const Landing = lazy(() => import("../pages/public/Landing"));
const Login = lazy(() => import("../pages/public/Login"));
const Signup = lazy(() => import("../pages/public/Signup"));
const Disclaimer = lazy(() => import("../pages/public/Disclaimer"));
const Dashboard = lazy(() => import("../pages/user/Dashboard"));
const Profile = lazy(() => import("../pages/user/Profile"));
const ForgotPassword = lazy(() => import("../pages/public/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/public/ResetPassword"));
const ScanHistory = lazy(() => import("../pages/user/ScanHistory"));
const ScanProgress = lazy(() => import("../pages/user/ScanProgress"));
const ScanResult = lazy(() => import("../pages/user/ScanResult"));
const StartScan = lazy(() => import("../pages/user/StartScan"));
const AboutTools = lazy(() => import("../pages/user/AboutTools"));
const Learn = lazy(() => import("../pages/public/Learn"));
const NotFound = lazy(() => import("../pages/public/NotFound"));

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
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
            <Route path="/learn" element={<Learn />} />
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
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRoutes;
