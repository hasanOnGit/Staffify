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
      setUser(parsed);
    }
    setLoading(false);
  }, []);

  /* ===============================
     LOGIN
  =============================== */
  const login = async (email, password) => {
    const res = await api.post("/login", { email, password });

    if (res.data?.user) {
      const userData = { ...res.data.user };
      // If backend doesn't return a name, derive one from email
      if (!userData.name) {
        userData.name = getNameFromEmail(userData.email || email);
      }
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    }

    return res.data;
  };

  /* ===============================
     REGISTER
  =============================== */
  const register = async (name, email, password) => {
    const res = await api.post("/register", {
      name,
      email,
      password,
    });

    return res.data;
  };

  /* ===============================
     LOGOUT
  =============================== */
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        logout,
        loading,
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
