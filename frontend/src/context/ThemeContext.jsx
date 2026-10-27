import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // 1. Check saved preference in localStorage
    const savedTheme = localStorage.getItem("staffify_theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      return savedTheme;
    }
    // 2. Default to light theme
    return "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("staffify_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";

    // Enable smooth CSS transition class across all elements
    const root = document.documentElement;
    root.classList.add("theme-transition");
    if (window.__themeTimeout) clearTimeout(window.__themeTimeout);
    window.__themeTimeout = setTimeout(() => {
      root.classList.remove("theme-transition");
    }, 450);

    // If browser supports View Transitions API, use native cross-fade transition
    if (typeof document !== "undefined" && document.startViewTransition) {
      document.startViewTransition(() => {
        setTheme(nextTheme);
      });
    } else {
      setTheme(nextTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export default ThemeContext;
