import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import AiAssistantDrawer from "../components/ai/AiAssistantDrawer";
import AiFloatingTrigger from "../components/ai/AiFloatingTrigger";
import CommandPalette from "../components/CommandPalette";
import KeyboardShortcutsModal from "../components/KeyboardShortcutsModal";
import NetworkStatusBanner from "../components/NetworkStatusBanner";
import { useTheme } from "../context/ThemeContext";

function DashboardLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const chordRef = useRef(null);
  const chordTimerRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();

  // Auto-close mobile drawer whenever route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Global Keyboard Shortcuts & Chorded Navigation
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Ignore if user is inside an input, textarea, or contentEditable element
      const targetTag = e.target.tagName?.toLowerCase();
      const isInput =
        targetTag === "input" ||
        targetTag === "textarea" ||
        targetTag === "select" ||
        e.target.isContentEditable;

      // 1. Command Palette: Ctrl+K / Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
        return;
      }

      // If user is inside an input, do not trigger chorded or single-key navigation
      if (isInput) return;

      // 2. Help / Shortcuts Modal: '?' (Shift + /)
      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setShortcutsModalOpen((prev) => !prev);
        return;
      }

      // 3. Dark Mode Quick Toggle: 'D' (without chords or modifiers)
      if (
        (e.key === "d" || e.key === "D") &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        chordRef.current !== "g"
      ) {
        e.preventDefault();
        toggleTheme();
        return;
      }

      // 4. Tactile Quick Actions: Alt + P (Attendance) & Alt + L (Leaves)
      if (e.altKey && (e.key === "p" || e.key === "P")) {
        e.preventDefault();
        navigate("/attendance");
        return;
      }
      if (e.altKey && (e.key === "l" || e.key === "L")) {
        e.preventDefault();
        navigate("/leaves?apply=true");
        return;
      }

      // 5. Chorded Navigation: 'G' followed by Target Key
      const key = e.key.toLowerCase();
      if (key === "g" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        chordRef.current = "g";
        clearTimeout(chordTimerRef.current);
        chordTimerRef.current = setTimeout(() => {
          chordRef.current = null;
        }, 1200); // 1.2s window for the second key
        return;
      }

      if (chordRef.current === "g") {
        chordRef.current = null;
        clearTimeout(chordTimerRef.current);

        const routes = {
          d: "/dashboard",
          e: "/employees",
          a: "/attendance",
          l: "/leaves",
          p: "/payroll",
          t: "/teams",
          w: "/webhook-bridge",
          u: "/audit-logs",
          h: "/helpdesk",
          r: "/recruitment",
        };

        if (routes[key]) {
          e.preventDefault();
          navigate(routes[key]);
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
      clearTimeout(chordTimerRef.current);
    };
  }, [navigate, toggleTheme]);

  return (
    <div className="h-screen flex flex-col bg-[#F4F5F7] dark:bg-[#090D14] overflow-hidden transition-colors">
      {/* Network Connectivity Offline/Online Banner */}
      <NetworkStatusBanner />

      {/* Top Navbar spans 100% full width */}
      <Navbar
        onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        isMobileMenuOpen={mobileMenuOpen}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      />

      {/* Workspace Area: Left Sidebar + Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 md:p-6 bg-[#F4F5F7] dark:bg-[#090D14] text-[#172B4D] dark:text-[#F1F5F9] transition-colors scroll-smooth">
          <div key={location.pathname} className="animate-page-enter min-h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Global Staffify AI Copilot Drawer & Trigger */}
      <AiAssistantDrawer />
      <AiFloatingTrigger />

      {/* Global Command Palette (Ctrl + K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* Global Keyboard Shortcuts Modal (?) */}
      <KeyboardShortcutsModal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />
    </div>
  );
}

export default DashboardLayout;
