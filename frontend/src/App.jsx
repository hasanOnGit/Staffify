import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Workers from "./pages/Workers";
import Vendors from "./pages/Vendors";
import Clients from "./pages/Clients";
import Commercials from "./pages/Commercials";
import Deployments from "./pages/Deployments";
import MusterRoll from "./pages/MusterRoll";
import Payroll from "./pages/Payroll";
import VendorInvoices from "./pages/VendorInvoices";
import Requisitions from "./pages/Requisitions";
import Compliance from "./pages/Compliance";
import Shifts from "./pages/Shifts";
import Loans from "./pages/Loans";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <WorkspaceProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: "#172B4D",
                color: "#F1F5F9",
                fontSize: "12px",
                fontWeight: 500,
                borderRadius: "6px",
                border: "1px solid #263042",
              },
              success: {
                iconTheme: {
                  primary: "#00875A",
                  secondary: "#FFFFFF",
                },
              },
              error: {
                iconTheme: {
                  primary: "#DE350B",
                  secondary: "#FFFFFF",
                },
              },
            }}
          />

          <DashboardLayout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/requisitions" element={<Requisitions />} />
              <Route path="/workers" element={<Workers />} />
              <Route path="/vendors" element={<Vendors />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/commercials" element={<Commercials />} />
              <Route path="/deployments" element={<Deployments />} />
              <Route path="/muster-roll" element={<MusterRoll />} />
              <Route path="/shifts" element={<Shifts />} />
              <Route path="/payroll" element={<Payroll />} />
              <Route path="/vendor-invoices" element={<VendorInvoices />} />
              <Route path="/compliance" element={<Compliance />} />
              <Route path="/loans" element={<Loans />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </DashboardLayout>
        </WorkspaceProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
