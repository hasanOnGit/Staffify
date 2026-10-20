import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function DashboardLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Auto-close mobile drawer whenever route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="h-screen flex flex-col bg-[#F4F5F7] overflow-hidden">
      {/* Top Navbar spans 100% full width (Jira style) */}
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
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 md:p-6 bg-[#F4F5F7]">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
