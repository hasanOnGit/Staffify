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
import OrgChart from "./pages/OrgChart";
import Expenses from "./pages/Expenses";
import Analytics from "./pages/Analytics";
import Timesheets from "./pages/Timesheets";
import Offboarding from "./pages/Offboarding";
import WebhookBridge from "./pages/WebhookBridge";
import AiCopilot from "./pages/AiCopilot";
import StaffifyLoader from "./components/StaffifyLoader";

import { useAuth } from "./context/AuthContext";
import { AiAssistantProvider } from "./context/AiAssistantContext";

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
    return <StaffifyLoader mode="fullscreen" size="lg" text="Authenticating secure workforce session..." />;
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
    return <StaffifyLoader mode="fullscreen" size="lg" text="Loading Staffify portal..." />;
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
      <AiAssistantProvider>
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
        <Route
          path="/org-chart"
          element={
            <ProtectedRoute>
              <OrgChart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <Expenses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/timesheets"
          element={
            <ProtectedRoute>
              <Timesheets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/copilot"
          element={
            <ProtectedRoute>
              <AiCopilot />
            </ProtectedRoute>
          }
        />

        {/* =========================================
            Manager & Admin Only (MSS & Executive)
           ========================================= */}
        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/offboarding"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
              <Offboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/webhook-bridge"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
              <WebhookBridge />
            </ProtectedRoute>
          }
        />
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
    </AiAssistantProvider>
  </BrowserRouter>
  );
}

export default App;
