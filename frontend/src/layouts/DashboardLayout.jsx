import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function DashboardLayout({ children }) {
  return (
    <div className="h-screen flex flex-col bg-[#F4F5F7] overflow-hidden">
      {/* Top Navbar spans 100% full width (Jira style) */}
      <Navbar />

      {/* Workspace Area: Left Sidebar + Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-5 sm:p-6 bg-[#F4F5F7]">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
