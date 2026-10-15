import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Leaves from "./pages/Leaves";
import Teams from "./pages/Teams";
import TeamDetails from "./pages/TeamDetails";
import Attendance from "./pages/Attendance";
import Employees from "./pages/Employees";
import Profile from "./pages/Profile";

/* ============================
   Auth Helpers
============================ */
const isAuthenticated = () => {
  return !!localStorage.getItem("token") || !!localStorage.getItem("user");
};

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
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

        {/* Protected greytHR Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees"
          element={
            <ProtectedRoute>
              <Employees />
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
          path="/teams"
          element={
            <ProtectedRoute>
              <Teams />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams/:teamId"
          element={
            <ProtectedRoute>
              <TeamDetails />
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
