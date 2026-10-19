import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Leaves from "./pages/Leaves";
import Teams from "./pages/Teams";
import TeamDetails from "./pages/TeamDetails";
import Attendance from "./pages/Attendance";
import Employees from "./pages/Employees";
import Profile from "./pages/Profile";
import Payroll from "./pages/Payroll";
import Payslips from "./pages/Payslips";
import Performance from "./pages/Performance";
import Roster from "./pages/Roster";
import Helpdesk from "./pages/Helpdesk";
import Recruitment from "./pages/Recruitment";

import { useAuth } from "./context/AuthContext";

/* ============================
   Auth & RBAC Helpers
============================ */
function RootRedirect() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
}

function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFBFC]">
        <div className="w-6 h-6 border-2 border-[#0052CC] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (user?.role || "Employee").toLowerCase();
    const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());

    if (!normalizedAllowed.includes(userRole)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFBFC]">
        <div className="w-6 h-6 border-2 border-[#0052CC] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

/* ============================
   App Component
============================ */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root Redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Public Auth Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* =========================================
            All Roles (ESS)
           ========================================= */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <Attendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaves"
          element={
            <ProtectedRoute>
              <Leaves />
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
          path="/payslips"
          element={
            <ProtectedRoute>
              <Payslips />
            </ProtectedRoute>
          }
        />
        <Route
          path="/performance"
          element={
            <ProtectedRoute>
              <Performance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/roster"
          element={
            <ProtectedRoute>
              <Roster />
            </ProtectedRoute>
          }
        />
        <Route
          path="/helpdesk"
          element={
            <ProtectedRoute>
              <Helpdesk />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            Manager & Admin Only (MSS)
           ========================================= */}
        <Route
          path="/teams"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
              <Teams />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruitment"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
              <Recruitment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams/:teamId"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
              <TeamDetails />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            Admin Only (HR Administration)
           ========================================= */}
        <Route
          path="/employees"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <Employees />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payroll"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <Payroll />
            </ProtectedRoute>
          }
        />

        {/* Fallback for any unknown route */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
