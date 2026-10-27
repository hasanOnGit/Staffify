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

  const toggleTheme = (event) => {
    const nextTheme = theme === "dark" ? "light" : "dark";

    if (typeof document === "undefined" || !document.startViewTransition) {
      setTheme(nextTheme);
      return;
    }

    // Determine the exact origin coordinates of the transition
    // Default to top-right where the navbar theme toggle sits
    let x = window.innerWidth - 60;
    let y = 30;

    if (event && typeof event.clientX === "number" && typeof event.clientY === "number" && (event.clientX !== 0 || event.clientY !== 0)) {
      x = event.clientX;
      y = event.clientY;
    } else {
      const btn = document.querySelector('[aria-label*="Switch to"]');
      if (btn) {
        const rect = btn.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      }
    }

    // Calculate the distance to the farthest viewport corner
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      setTheme(nextTheme);
    });

    transition.ready
      .then(() => {
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ];

        document.documentElement.animate(
          {
            clipPath: clipPath,
          },
          {
            duration: 600,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            pseudoElement: "::view-transition-new(root)",
          }
        );
      })
      .catch(() => {});
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
