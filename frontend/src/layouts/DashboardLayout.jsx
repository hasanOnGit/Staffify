import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function DashboardLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Auto-close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleQuickCreate = () => {
    // Jump to the current relevant modal or vendor onboarding
    navigate("/vendors");
  };

  return (
    <div className="h-screen flex flex-col bg-[#F4F5F7] dark:bg-[#090D14] overflow-hidden transition-colors">
      {/* Top Navbar spans 100% width across the very top */}
      <Navbar
        onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        isMobileMenuOpen={mobileMenuOpen}
        onQuickCreate={handleQuickCreate}
        onSearchClick={() => {}}
      />

      {/* Split body below Navbar: Sidebar and Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F4F5F7] dark:bg-[#090D14] text-[#172B4D] dark:text-[#F1F5F9] transition-colors scroll-smooth">
          <div key={location.pathname} className="animate-page-enter min-h-full max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
