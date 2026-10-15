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

/* ============================
   Auth & RBAC Helpers
============================ */
const isAuthenticated = () => {
  return !!localStorage.getItem("token") || !!localStorage.getItem("user");
};

const getCurrentUser = () => {
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

function ProtectedRoute({ children, allowedRoles }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const user = getCurrentUser();
    const userRole = (user?.role || "Employee").toLowerCase();
    const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());

    if (!normalizedAllowed.includes(userRole)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

function PublicRoute({ children }) {
  if (isAuthenticated()) {
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
        <Route
          path="/"
          element={
            <Navigate to={isAuthenticated() ? "/dashboard" : "/login"} replace />
          }
        />

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
        <Route
          path="*"
          element={
            <Navigate to={isAuthenticated() ? "/dashboard" : "/login"} replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
