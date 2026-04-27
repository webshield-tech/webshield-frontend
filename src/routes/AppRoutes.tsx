import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import AdminRoute from "../routes/AdminRoutes";
import ProtectedRoute from "../components/common/ProtectedRoute";
import { useAuth } from "../context/AuthContext"; 
import LoadingScreen from "../components/common/LoadingScreen";
import MainLayout from "../components/layout/MainLayout";

// Helper to handle chunk loading errors (happens when app is updated while user is on it)
const lazyRetry = (componentImport: () => Promise<any>) => {
  return lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      console.error("Chunk load failed, refreshing page...", error);
      // Only reload once to avoid infinite loops
      const hasReloaded = sessionStorage.getItem("chunk_reload_failed");
      if (!hasReloaded) {
        sessionStorage.setItem("chunk_reload_failed", "true");
        window.location.reload();
        return { default: () => null }; // Return dummy while reloading
      }
      throw error; // Rethrow if it fails even after reload
    }
  });
};

// Lazy-loaded components with retry logic
const AdminDashboard = lazyRetry(() => import("../pages/admin/AdminDashboard"));
const AdminScans = lazyRetry(() => import("../pages/admin/AdminScan"));
const AdminUsers = lazyRetry(() => import("../pages/admin/AdminUser"));
const Landing = lazyRetry(() => import("../pages/public/Landing"));
const Login = lazyRetry(() => import("../pages/public/Login"));
const Signup = lazyRetry(() => import("../pages/public/Signup"));
const Disclaimer = lazyRetry(() => import("../pages/public/Disclaimer"));
const Dashboard = lazyRetry(() => import("../pages/user/Dashboard"));
const Profile = lazyRetry(() => import("../pages/user/Profile"));
const ForgotPassword = lazyRetry(() => import("../pages/public/ForgotPassword"));
const ResetPassword = lazyRetry(() => import("../pages/public/ResetPassword"));
const ScanHistory = lazyRetry(() => import("../pages/user/ScanHistory"));
const ScanProgress = lazyRetry(() => import("../pages/user/ScanProgress"));
const ScanResult = lazyRetry(() => import("../pages/user/ScanResult"));
const StartScan = lazyRetry(() => import("../pages/user/StartScan"));
const AboutTools = lazyRetry(() => import("../pages/user/AboutTools"));
const Learn = lazyRetry(() => import("../pages/public/Learn"));
const NotFound = lazyRetry(() => import("../pages/public/NotFound"));

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
