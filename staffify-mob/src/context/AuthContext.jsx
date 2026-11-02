import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("staffify_token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem("staffify_token");
      const savedUser = localStorage.getItem("staffify_user");

      if (savedToken && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setToken(savedToken);
        } catch (e) {
          console.error("Auth init parse error:", e);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/api/auth/login", { email, password });
    if (res.data?.token) {
      const userObj = res.data.user || {
        userId: res.data.userId || "USR-DEFAULT",
        employeeId: res.data.employeeId || "EMP-001",
        name: res.data.name || email.split("@")[0],
        email: email,
        role: res.data.role || "Employee",
      };

      setToken(res.data.token);
      setUser(userObj);
      localStorage.setItem("staffify_token", res.data.token);
      localStorage.setItem("staffify_user", JSON.stringify(userObj));
      return { success: true, user: userObj };
    }
    return { success: false, error: "Invalid credentials" };
  };

  const logout = () => {
    localStorage.removeItem("staffify_token");
    localStorage.removeItem("staffify_user");
    setToken(null);
    setUser(null);
  };

  const isManager = user?.role === "Manager" || user?.role === "Admin";
  const isAdmin = user?.role === "Admin";
  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isManager,
        isAdmin,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
