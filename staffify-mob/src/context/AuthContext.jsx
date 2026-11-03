import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("staffify_token") || null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [offlineQueue, setOfflineQueue] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("staffify_offline_punches") || "[]");
    } catch {
      return [];
    }
  });

  // Track network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflinePunches();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Initialize Auth
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
      } else {
        // Default to Employee demo session if fresh
        const defaultUser = {
          userId: "EMP-042",
          employeeId: "EMP-042",
          name: "Aarav Sharma",
          email: "employee@staffify.com",
          role: "Employee",
          department: "Engineering",
          designation: "Senior Software Engineer"
        };
        setUser(defaultUser);
        localStorage.setItem("staffify_user", JSON.stringify(defaultUser));
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    let res;
    try {
      res = await api.post("/api/login", { email, password });
    } catch (err) {
      try {
        res = await api.post("/login", { email, password });
      } catch (err2) {
        // Fallback demo mock if server unreachable
        const role = email.includes("admin") ? "Admin" : email.includes("manager") ? "Manager" : "Employee";
        const userObj = {
          userId: role === "Admin" ? "EMP-ADMIN-01" : role === "Manager" ? "EMP-MGR-02" : "EMP-042",
          employeeId: role === "Admin" ? "EMP-ADMIN-01" : role === "Manager" ? "EMP-MGR-02" : "EMP-042",
          name: role === "Admin" ? "Ananya Sharma" : role === "Manager" ? "Priya Sundaram" : "Aarav Sharma",
          email,
          role,
          department: role === "Admin" ? "Operations" : role === "Manager" ? "Engineering Management" : "Engineering",
          designation: role === "Admin" ? "Head of HR & Ops" : role === "Manager" ? "Engineering Manager" : "Senior Software Engineer"
        };
        setUser(userObj);
        localStorage.setItem("staffify_user", JSON.stringify(userObj));
        return { success: true, user: userObj };
      }
    }

    if (res?.data?.token) {
      const userObj = res.data.user || {
        userId: res.data.userId || "USR-DEFAULT",
        employeeId: res.data.employeeId || "EMP-001",
        name: res.data.name || email.split("@")[0],
        email: email,
        role: res.data.role || "Employee",
        department: res.data.department || "General",
        designation: res.data.designation || "Staff"
      };

      setToken(res.data.token);
      setUser(userObj);
      localStorage.setItem("staffify_token", res.data.token);
      localStorage.setItem("staffify_user", JSON.stringify(userObj));
      return { success: true, user: userObj };
    }
    return { success: false, error: "Invalid credentials" };
  };

  // Instant 1-Tap Role Switcher for seamless testing across all personas
  const switchRole = async (targetRole) => {
    let targetEmail = "employee@staffify.com";
    let targetPassword = "Employee@123";

    if (targetRole === "Admin") {
      targetEmail = "admin@staffify.com";
      targetPassword = "Admin@123";
    } else if (targetRole === "Manager") {
      targetEmail = "manager@staffify.com";
      targetPassword = "Manager@123";
    }

    return await login(targetEmail, targetPassword);
  };

  const logout = () => {
    localStorage.removeItem("staffify_token");
    localStorage.removeItem("staffify_user");
    setToken(null);
    setUser(null);
  };

  // Offline queue helpers
  const queueOfflinePunch = (punchData) => {
    const updated = [...offlineQueue, { ...punchData, queuedAt: new Date().toISOString() }];
    setOfflineQueue(updated);
    localStorage.setItem("staffify_offline_punches", JSON.stringify(updated));
  };

  const syncOfflinePunches = useCallback(async () => {
    const queue = JSON.parse(localStorage.getItem("staffify_offline_punches") || "[]");
    if (!queue.length) return { synced: 0, remaining: 0 };

    let syncedCount = 0;
    const remaining = [];

    for (const item of queue) {
      try {
        let sent = false;
        try {
          await api.post("/api/attendance/punch", item);
          sent = true;
        } catch {
          await api.post("/api/punch", item);
          sent = true;
        }
        if (sent) syncedCount++;
      } catch (err) {
        console.warn("Could not sync offline punch item yet:", err);
        remaining.push(item);
      }
    }

    setOfflineQueue(remaining);
    localStorage.setItem("staffify_offline_punches", JSON.stringify(remaining));
    return { synced: syncedCount, remaining: remaining.length };
  }, []);

  const isManager = user?.role === "Manager" || user?.role === "Admin";
  const isAdmin = user?.role === "Admin";
  const isEmployee = user?.role === "Employee";
  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isOnline,
        offlineQueue,
        isAuthenticated,
        isManager,
        isAdmin,
        isEmployee,
        login,
        switchRole,
        logout,
        setUser,
        queueOfflinePunch,
        syncOfflinePunches
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
