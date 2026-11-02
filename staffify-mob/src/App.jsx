import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MobileLayout from './layouts/MobileLayout';
import MobileDashboard from './pages/MobileDashboard';
import MobileSwipes from './pages/MobileSwipes';
import MobileLeaves from './pages/MobileLeaves';
import MobilePayslips from './pages/MobilePayslips';
import MobileApprovals from './pages/MobileApprovals';
import MobileProfile from './pages/MobileProfile';
import MobileLogin from './pages/MobileLogin';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F5F7] dark:bg-[#090D14]">
        <div className="w-8 h-8 border-3 border-[#0052CC] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<MobileLogin />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MobileLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<MobileDashboard />} />
            <Route path="swipes" element={<MobileSwipes />} />
            <Route path="leaves" element={<MobileLeaves />} />
            <Route path="payslips" element={<MobilePayslips />} />
            <Route path="approvals" element={<MobileApprovals />} />
            <Route path="profile" element={<MobileProfile />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
