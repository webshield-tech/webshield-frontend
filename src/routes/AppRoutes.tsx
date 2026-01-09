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
import NotFound from "../pages/public/NotFound";

function AppRoutes() {
  const { user, loading } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes - always accessible */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Disclaimer - only for authenticated users who haven't accepted terms */}
        <Route 
          path="/disclaimer" 
          element={
            user ? (
              !user.agreedToTerms ? (
                <Disclaimer />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* Protected routes - require auth and terms acceptance */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              {user?.agreedToTerms ? <Dashboard /> : <Navigate to="/disclaimer" replace />}
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              {user?.agreedToTerms ? <Profile /> : <Navigate to="/disclaimer" replace />}
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/start-scan" 
          element={
            <ProtectedRoute>
              {user?.agreedToTerms ? <StartScan /> : <Navigate to="/disclaimer" replace />}
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/scan-progress/:scanId" 
          element={
            <ProtectedRoute>
              {user?.agreedToTerms ? <ScanProgress /> : <Navigate to="/disclaimer" replace />}
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/scan-result/:scanId" 
          element={
            <ProtectedRoute>
              {user?.agreedToTerms ? <ScanResult /> : <Navigate to="/disclaimer" replace />}
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/scan-history" 
          element={
            <ProtectedRoute>
              {user?.agreedToTerms ? <ScanHistory /> : <Navigate to="/disclaimer" replace />}
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/about-tools" 
          element={
            <ProtectedRoute>
              {user?.agreedToTerms ? <AboutTools /> : <Navigate to="/disclaimer" replace />}
            </ProtectedRoute>
          } 
        />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminRoute />}>
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