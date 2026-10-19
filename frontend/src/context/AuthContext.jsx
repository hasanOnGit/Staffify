import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

/* ===============================
   Helper: derive display name from email
   e.g. "john.doe@company.com" → "John Doe"
=============================== */
const getNameFromEmail = (email) => {
  if (!email) return "User";
  const localPart = email.split("@")[0]; // "john.doe"
  return localPart
    .split(/[._-]/) // split on dots, underscores, hyphens
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ===============================
     Restore user on refresh
  =============================== */
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      // Ensure name is always populated
      if (!parsed.name && parsed.email) {
        parsed.name = getNameFromEmail(parsed.email);
      }
      if (!parsed.employeeId && parsed.userId) {
        parsed.employeeId = parsed.userId;
      }
      setUser(parsed);
    }
    setLoading(false);
  }, []);

  /* ===============================
     LOGIN
  =============================== */
  const login = async (email, password) => {
    try {
      const res = await api.post("/login", { email, password });

      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
      }

      if (res.data?.user) {
        const userData = { ...res.data.user };
        if (!userData.name) {
          userData.name = getNameFromEmail(userData.email || email);
        }
        if (!userData.employeeId && userData.userId) {
          userData.employeeId = userData.userId;
        }
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
      }

      return res.data;
    } catch (error) {
      console.error("[v0] Login request failed", {
        status: error.response?.status,
        message: error.response?.data?.msg || error.message,
        url: error.config?.url,
      });
      throw error;
    }

  };

  /* ===============================
     REGISTER
  =============================== */
  const register = async (name, email, password, role = "Employee") => {
    const res = await api.post("/register", {
      name,
      email,
      password,
      role,
    });

    if (res.data?.token) {
      localStorage.setItem("token", res.data.token);
    }

    if (res.data?.user) {
      const userData = { ...res.data.user };
      if (!userData.employeeId && userData.userId) {
        userData.employeeId = userData.userId;
      }
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    }

    return res.data;
  };

  /* ===============================
     LOGOUT
  =============================== */
  const logout = () => {
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("staffify_is_clocked_in");
      localStorage.removeItem("staffify_clock_in_time");
    } catch (e) {
      console.warn("Error clearing storage on logout:", e);
    }
    setUser(null);
  };

  const role = user?.role || "Employee";
  const isAdmin = role.toLowerCase() === "admin";
  const isManager = role.toLowerCase() === "manager" || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        logout,
        loading,
        role,
        isAdmin,
        isManager,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* ===============================
   Custom Hook
=============================== */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
