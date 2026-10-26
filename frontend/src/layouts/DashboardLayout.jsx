import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import AiAssistantDrawer from "../components/ai/AiAssistantDrawer";
import AiFloatingTrigger from "../components/ai/AiFloatingTrigger";

function DashboardLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Auto-close mobile drawer whenever route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="h-screen flex flex-col bg-[#F4F5F7] dark:bg-[#090D14] overflow-hidden transition-colors">
      {/* Top Navbar spans 100% full width */}
      <Navbar
        onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        isMobileMenuOpen={mobileMenuOpen}
      />

      {/* Workspace Area: Left Sidebar + Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 md:p-6 bg-[#F4F5F7] dark:bg-[#090D14] text-[#172B4D] dark:text-[#F1F5F9] transition-colors">
          {children}
        </main>
      </div>

      {/* Global Staffify AI Copilot Drawer & Trigger */}
      <AiAssistantDrawer />
      <AiFloatingTrigger />
    </div>
  );
}

export default DashboardLayout;
