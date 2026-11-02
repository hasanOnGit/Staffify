import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  Building2,
  Mail,
  Phone,
  ShieldCheck,
  ChevronRight,
  Filter,
  UserCheck,
  AlertCircle,
  Sparkles,
  Lock
} from "lucide-react";

export default function MobileWorkforce() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");

  // If accessed by non-Admin, show standard Atlassian access denied card
  if (!isAdmin) {
    return (
      <div className="p-6 text-center space-y-4 pt-10">
        <div className="w-14 h-14 rounded-3xl bg-[#FFEBE6] dark:bg-rose-950/40 text-[#DE350B] flex items-center justify-center mx-auto border border-[#DE350B]/20">
          <Lock className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <span className="px-2.5 py-0.5 rounded-full bg-[#FFEBE6] text-[#DE350B] text-[10px] font-extrabold uppercase tracking-wider">
            Access Restricted
          </span>
          <h2 className="text-lg font-bold text-[#172B4D] dark:text-white">Administrator Role Required</h2>
          <p className="text-xs text-[#6B778C] dark:text-slate-400 max-w-xs mx-auto">
            The Organization Workforce Directory is restricted to Administrator personnel. Your session is currently authenticated as <span className="font-bold text-[#0052CC]">{user?.role || "Employee"}</span>.
          </p>
        </div>
        <button
          onClick={() => navigate("/")}
          className="px-5 py-2.5 rounded-2xl bg-[#0052CC] text-white text-xs font-bold shadow-xs active:scale-95 transition-transform"
        >
          Return to My Workspace
        </button>
      </div>
    );
  }

  const departments = ["All", "Engineering", "Product", "Operations", "Sales", "Finance"];

  const workforceList = [
    { id: "EMP-001", name: "Ananya Sharma", role: "Head of HR & Ops", dept: "Operations", status: "Active", email: "ananya.sharma@staffify.com" },
    { id: "EMP-002", name: "Priya Sundaram", role: "Engineering Manager", dept: "Engineering", status: "Active", email: "priya.sundaram@staffify.com" },
    { id: "EMP-042", name: "Aarav Sharma", role: "Senior Software Engineer", dept: "Engineering", status: "Active", email: "aarav.sharma@staffify.com" },
    { id: "EMP-014", name: "Priya Sharma", role: "Frontend Developer", dept: "Engineering", status: "Active", email: "priya.sharma@staffify.com" },
    { id: "EMP-029", name: "Rahul Verma", role: "Backend Developer", dept: "Engineering", status: "Active", email: "rahul.verma@staffify.com" },
    { id: "EMP-033", name: "Aman Patel", role: "DevOps Engineer", dept: "Engineering", status: "Active", email: "aman.patel@staffify.com" },
    { id: "EMP-041", name: "Neha Deshmukh", role: "QA Lead", dept: "Product", status: "Active", email: "neha.deshmukh@staffify.com" },
    { id: "EMP-055", name: "Kabir Das", role: "Account Executive", dept: "Sales", status: "Active", email: "kabir.das@staffify.com" },
    { id: "EMP-061", name: "Meera Nair", role: "Senior Financial Analyst", dept: "Finance", status: "Active", email: "meera.nair@staffify.com" }
  ];

  const filtered = workforceList.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === "All" || emp.dept === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="pb-8 space-y-4 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0052CC] to-[#0747A6] rounded-3xl p-5 text-white shadow-md space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider">
          <Building2 className="w-3 h-3 text-cyan-300" />
          <span>Admin Master Directory</span>
        </div>
        <h1 className="text-xl font-extrabold leading-tight">Workforce Roster</h1>
        <p className="text-xs text-blue-100">
          42 Total Registered Employees across 5 Corporate Departments
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#6B778C] dark:text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search employee by name, ID, or title..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#DFE1E6] dark:border-[#263042] bg-white dark:bg-[#0F131C] text-xs text-[#172B4D] dark:text-white placeholder-[#8993A4] focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
          />
        </div>

        {/* Department Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedDept === dept
                  ? "bg-[#0052CC] text-white shadow-xs"
                  : "bg-white dark:bg-[#0F131C] border border-[#DFE1E6] dark:border-[#263042] text-[#6B778C] dark:text-slate-300 hover:border-[#0052CC]"
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Employee List Cards */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-[#6B778C] dark:text-slate-400 px-1">
          <span>Showing {filtered.length} Employees</span>
          <span className="font-semibold text-[#00875A]">100% Active Directory</span>
        </div>

        {filtered.map((emp) => (
          <div
            key={emp.id}
            className="bg-white dark:bg-[#0F131C] p-3.5 rounded-2xl border border-[#DFE1E6]/80 dark:border-[#263042] shadow-xs flex items-center justify-between hover:border-[#0052CC] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#DEEBFF] dark:bg-blue-950/60 text-[#0052CC] font-black text-xs flex items-center justify-center">
                {emp.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xs text-[#172B4D] dark:text-white">{emp.name}</h3>
                  <span className="text-[10px] text-[#6B778C] dark:text-slate-400 font-mono">({emp.id})</span>
                </div>
                <p className="text-[11px] text-[#6B778C] dark:text-slate-400 font-medium">{emp.role}</p>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="px-2 py-0.2 rounded-md bg-[#EBECF0] dark:bg-[#263042] text-[9px] font-bold text-[#172B4D] dark:text-slate-300">
                    {emp.dept}
                  </span>
                  <span className="text-[9px] text-[#00875A] font-bold flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3" /> Active
                  </span>
                </div>
              </div>
            </div>

            <a
              href={`mailto:${emp.email}`}
              className="p-2.5 rounded-xl border border-[#DFE1E6] dark:border-[#263042] text-[#0052CC] dark:text-blue-400 active:scale-90 transition-transform"
              title="Contact Employee"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
