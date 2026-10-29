import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";

import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: "#172B4D",
            color: "#F1F5F9",
            fontSize: "12px",
            fontWeight: "500",
            borderRadius: "6px",
            padding: "10px 14px",
            border: "1px solid #263042",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.35)",
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
      <App />
    </AuthProvider>
  </StrictMode>
);
