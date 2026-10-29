import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext";
import DashboardLayout from "./layouts/DashboardLayout";
import Vendors from "./pages/Vendors";
import Clients from "./pages/Clients";
import Commercials from "./pages/Commercials";
import Deployments from "./pages/Deployments";
import VendorInvoices from "./pages/VendorInvoices";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
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
            <Route path="/" element={<Navigate to="/vendors" replace />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/commercials" element={<Commercials />} />
            <Route path="/deployments" element={<Deployments />} />
            <Route path="/vendor-invoices" element={<VendorInvoices />} />
            <Route path="*" element={<Navigate to="/vendors" replace />} />
          </Routes>
        </DashboardLayout>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
