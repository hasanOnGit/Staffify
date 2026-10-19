import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getOrgTree } from "../services/employee";
import {
  Network,
  List,
  Search,
  Users,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Briefcase,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";

function TreeNode({ node, collapsed, toggleCollapse, onSelect, searchQuery, selectedDept }) {
  const isMatch = useMemo(() => {
    if (!searchQuery) return false;
    const q = searchQuery.toLowerCase();
    return (
      node.name?.toLowerCase().includes(q) ||
      node.designation?.toLowerCase().includes(q) ||
      node.department?.toLowerCase().includes(q) ||
      node.employeeId?.toLowerCase().includes(q)
    );
  }, [node, searchQuery]);

  const isDeptMatch = !selectedDept || selectedDept === "All" || node.department === selectedDept;
  const isCollapsed = collapsed[node.employeeId];
  const hasChildren = node.children && node.children.length > 0;

  // Department color accent
  const deptBadgeColor =
    node.department === "Human Resources"
      ? "bg-[#EAE6FF] text-[#403294] border-[#C0B6F2]"
      : node.department === "Management"
      ? "bg-[#FFF0B3] text-[#172B4D] border-[#FFE380]"
      : "bg-[#DEEBFF] text-[#0052CC] border-[#B3D4FF]";

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <div
        onClick={() => onSelect(node)}
        className={`w-64 bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer text-left relative ${
          isMatch
            ? "border-[#0052CC] ring-2 ring-[#0052CC]/20 bg-[#DEEBFF]/10"
            : !isDeptMatch
            ? "opacity-60 border-[#DFE1E6]"
            : "border-[#DFE1E6] hover:border-[#0052CC]/50"
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0052CC] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-inner">
            {node.name
              ? node.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()
              : "EM"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h4 className="font-bold text-[#172B4D] text-xs truncate leading-snug">
                {node.name}
              </h4>
              <span className="text-[10px] font-mono text-[#6B778C] shrink-0">
                {node.employeeId}
              </span>
            </div>
            <p className="text-[11px] text-[#42526E] font-medium truncate mt-0.5">
              {node.designation}
            </p>
            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
              <span
                className={`text-[9px] font-semibold px-2 py-0.5 rounded border ${deptBadgeColor}`}
              >
                {node.department}
              </span>
              {node.managerId === null || !node.managerId ? (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#E3FCEF] text-[#006644] border border-[#ABF5D1]">
                  Executive Root
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Bottom meta & Direct Reports Count */}
        <div className="mt-3 pt-2.5 border-t border-[#F4F5F7] flex items-center justify-between text-[11px] text-[#6B778C]">
          <span className="flex items-center gap-1">
            <MapPin size={11} className="text-[#6B778C]" />
            <span className="truncate max-w-[100px]">{node.workLocation || "HQ"}</span>
          </span>

          {hasChildren && (
            <span className="inline-flex items-center gap-1 font-semibold text-[#0052CC] bg-[#DEEBFF] px-2 py-0.5 rounded-full text-[10px] border border-[#B3D4FF]">
              <Users size={11} />
              <span>{node.children.length} Reports</span>
            </span>
          )}
        </div>

        {/* Collapse / Expand Toggle Button */}
        {hasChildren && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleCollapse(node.employeeId);
            }}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border border-[#DFE1E6] hover:border-[#0052CC] shadow-sm flex items-center justify-center text-[#42526E] hover:text-[#0052CC] transition cursor-pointer z-10"
            title={isCollapsed ? "Expand Subordinates" : "Collapse Subordinates"}
          >
            {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
          </button>
        )}
      </div>

      {/* Children Connector Lines & Subtree */}
      {hasChildren && !isCollapsed && (
        <div className="flex flex-col items-center">
          {/* Vertical stem from parent */}
          <div className="w-0.5 h-6 bg-[#DFE1E6]" />

          {/* Horizontal crossbar (if more than 1 child) */}
          <div className="flex items-start justify-center">
            {node.children.map((child, index) => {
              const isFirst = index === 0;
              const isLast = index === node.children.length - 1;
              const isOnly = node.children.length === 1;

              return (
                <div key={child.employeeId} className="flex flex-col items-center px-4 relative">
                  {/* Top horizontal branch connector */}
                  {!isOnly && (
                    <div
                      className={`absolute top-0 h-0.5 bg-[#DFE1E6] ${
                        isFirst
                          ? "left-1/2 right-0"
                          : isLast
                          ? "left-0 right-1/2"
                          : "left-0 right-0"
                      }`}
                    />
                  )}
                  {/* Vertical stem to child */}
                  <div className="w-0.5 h-6 bg-[#DFE1E6]" />

                  {/* Child Node */}
                  <TreeNode
                    node={child}
                    collapsed={collapsed}
                    toggleCollapse={toggleCollapse}
                    onSelect={onSelect}
                    searchQuery={searchQuery}
                    selectedDept={selectedDept}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function OrgChart() {
  const [tree, setTree] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [viewMode, setViewMode] = useState("tree"); // "tree" | "list"
  const [collapsed, setCollapsed] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const fetchTree = async () => {
    try {
      setLoading(true);
      const res = await getOrgTree();
      if (res.success) {
        setTree(res.tree || []);
        setNodes(res.nodes || []);
      }
    } catch (err) {
      console.error("Failed to load org tree:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, []);

  const toggleCollapse = (empId) => {
    setCollapsed((prev) => ({
      ...prev,
      [empId]: !prev[empId],
    }));
  };

  const departments = useMemo(() => {
    const set = new Set();
    nodes.forEach((n) => {
      if (n.department) set.add(n.department);
    });
    return ["All", ...Array.from(set)];
  }, [nodes]);

  const filteredList = useMemo(() => {
    return nodes.filter((n) => {
      const matchDept = selectedDept === "All" || n.department === selectedDept;
      const matchSearch =
        !searchQuery ||
        n.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.designation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.employeeId?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDept && matchSearch;
    });
  }, [nodes, selectedDept, searchQuery]);

  return (
    <DashboardLayout>
      <div className="space-y-5 pb-10">
        {/* Header Banner */}
        <div className="bg-white border border-[#DFE1E6] rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#DEEBFF] text-[#0052CC] border border-[#B3D4FF]">
                <Network size={18} />
              </span>
              <h1 className="text-xl font-bold text-[#172B4D]">
                Organization Chart & Reporting Hierarchy
              </h1>
            </div>
            <p className="text-xs text-[#6B778C] mt-1">
              Interactive structural reporting tree, leadership hierarchy, and workforce team lines.
            </p>
          </div>

          {/* Action / View Switchers */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center border border-[#DFE1E6] rounded-lg p-0.5 bg-[#F4F5F7]">
              <button
                type="button"
                onClick={() => setViewMode("tree")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === "tree"
                    ? "bg-white text-[#0052CC] shadow-xs"
                    : "text-[#6B778C] hover:text-[#172B4D]"
                }`}
              >
                <Network size={13} />
                <span>Visual Tree</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white text-[#0052CC] shadow-xs"
                    : "text-[#6B778C] hover:text-[#172B4D]"
                }`}
              >
                <List size={13} />
                <span>Reporting List</span>
              </button>
            </div>

            {viewMode === "tree" && (
              <div className="flex items-center border border-[#DFE1E6] rounded-lg bg-white p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
                  className="p-1 text-[#6B778C] hover:text-[#172B4D] hover:bg-[#F4F5F7] rounded cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut size={14} />
                </button>
                <span className="text-[11px] font-mono font-semibold text-[#172B4D] px-1">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
                  className="p-1 text-[#6B778C] hover:text-[#172B4D] hover:bg-[#F4F5F7] rounded cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(1)}
                  className="p-1 text-[#6B778C] hover:text-[#172B4D] hover:bg-[#F4F5F7] rounded cursor-pointer ml-1 border-l border-[#DFE1E6]"
                  title="Reset Zoom"
                >
                  <RotateCcw size={13} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white border border-[#DFE1E6] rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B778C]" />
            <input
              type="text"
              placeholder="Search employee, designation, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-[#DFE1E6] rounded-lg focus:outline-none focus:border-[#0052CC] bg-[#FAFBFC]"
            />
          </div>

          {/* Department Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {departments.map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => setSelectedDept(dept)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-full border transition cursor-pointer whitespace-nowrap ${
                  selectedDept === dept
                    ? "bg-[#0052CC] text-white border-[#0052CC]"
                    : "bg-[#F4F5F7] text-[#42526E] border-[#DFE1E6] hover:bg-[#EBECF0]"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Tree Canvas / List View */}
        {loading ? (
          <div className="bg-white border border-[#DFE1E6] rounded-xl p-16 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-[#0052CC] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-[#6B778C] font-medium">Constructing organizational hierarchy tree...</p>
          </div>
        ) : viewMode === "tree" ? (
          <div className="bg-[#FAFBFC] border border-[#DFE1E6] rounded-xl p-8 shadow-inner overflow-x-auto min-h-[500px]">
            <div
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: "top center",
                transition: "transform 0.15s ease-out",
              }}
              className="inline-flex justify-center w-full min-w-max pb-12"
            >
              {tree.length > 0 ? (
                <div className="flex gap-16 justify-center">
                  {tree.map((rootNode) => (
                    <TreeNode
                      key={rootNode.employeeId}
                      node={rootNode}
                      collapsed={collapsed}
                      toggleCollapse={toggleCollapse}
                      onSelect={(node) => setSelectedEmployee(node)}
                      searchQuery={searchQuery}
                      selectedDept={selectedDept}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-xs text-[#6B778C]">
                  No organizational nodes available.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Table / List View */
          <div className="bg-white border border-[#DFE1E6] rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F5F7] text-[#42526E] uppercase text-[10px] font-bold border-b border-[#DFE1E6]">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Designation</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Reports To (Manager)</th>
                  <th className="px-4 py-3">Direct Reports</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE1E6]">
                {filteredList.map((emp) => (
                  <tr key={emp.employeeId} className="hover:bg-[#FAFBFC] transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#0052CC] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {emp.name
                            ? emp.name
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase()
                            : "EM"}
                        </div>
                        <div>
                          <p className="font-bold text-[#172B4D]">{emp.name}</p>
                          <p className="text-[10px] font-mono text-[#6B778C]">{emp.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-[#172B4D]">{emp.designation}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#DEEBFF] text-[#0052CC] border border-[#B3D4FF]">
                        {emp.department}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {emp.managerName ? (
                        <div className="flex items-center gap-1.5 text-[#172B4D]">
                          <User size={12} className="text-[#6B778C]" />
                          <span>{emp.managerName}</span>
                          <span className="text-[10px] text-[#6B778C]">({emp.managerId})</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-semibold text-[#006644] bg-[#E3FCEF] px-2 py-0.5 rounded border border-[#ABF5D1]">
                          Executive Root
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-[#172B4D]">{emp.directReportsCount}</span>
                      <span className="text-[#6B778C] ml-1">direct</span>
                    </td>
                    <td className="px-4 py-3 text-[#6B778C]">{emp.workLocation || "Headquarters"}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedEmployee(emp)}
                        className="px-2.5 py-1 text-xs font-semibold text-[#0052CC] bg-[#DEEBFF] hover:bg-[#B3D4FF] rounded-md transition cursor-pointer"
                      >
                        Profile Card
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Employee Detail Modal */}
        {selectedEmployee && (
          <div className="fixed inset-0 z-50 bg-[#091E42]/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-[#DFE1E6] max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#0052CC] to-[#0747A6] p-6 text-white relative">
                <button
                  type="button"
                  onClick={() => setSelectedEmployee(null)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition cursor-pointer"
                >
                  <RotateCcw size={14} className="rotate-45" />
                </button>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white text-[#0052CC] flex items-center justify-center font-bold text-lg shadow-md border-2 border-white">
                    {selectedEmployee.name
                      ? selectedEmployee.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()
                      : "EM"}
                  </div>
                  <div>
                    <h3 className="font-bold text-base leading-tight">
                      {selectedEmployee.name}
                    </h3>
                    <p className="text-xs text-white/90 mt-0.5">{selectedEmployee.designation}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded">
                        {selectedEmployee.employeeId}
                      </span>
                      <span className="text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded">
                        {selectedEmployee.department}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3.5 text-xs text-[#172B4D]">
                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-[#FAFBFC] border border-[#DFE1E6]">
                  <Mail size={14} className="text-[#0052CC]" />
                  <div>
                    <span className="text-[10px] text-[#6B778C] block uppercase font-bold">Email Address</span>
                    <span className="font-medium">{selectedEmployee.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-[#FAFBFC] border border-[#DFE1E6]">
                  <Phone size={14} className="text-[#0052CC]" />
                  <div>
                    <span className="text-[10px] text-[#6B778C] block uppercase font-bold">Phone Number</span>
                    <span className="font-medium">{selectedEmployee.phoneNo || "Not Specified"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-2.5 rounded-lg bg-[#FAFBFC] border border-[#DFE1E6]">
                    <span className="text-[10px] text-[#6B778C] block uppercase font-bold">Work Location</span>
                    <span className="font-semibold">{selectedEmployee.workLocation || "HQ"}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#FAFBFC] border border-[#DFE1E6]">
                    <span className="text-[10px] text-[#6B778C] block uppercase font-bold">Joining Date</span>
                    <span className="font-semibold">{selectedEmployee.dateOfJoining || "Active Staff"}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#DEEBFF]/30 border border-[#B3D4FF] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#0747A6] font-bold uppercase block">Reports Directly To</span>
                    <span className="font-bold text-[#172B4D]">
                      {selectedEmployee.managerName || "None (Executive Root)"}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[#0052CC] bg-white px-2 py-1 rounded border border-[#B3D4FF]">
                    {selectedEmployee.directReportsCount} Direct Reports
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-[#F4F5F7] border-t border-[#DFE1E6] flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedEmployee(null)}
                  className="px-4 py-2 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-semibold rounded-lg transition cursor-pointer"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default OrgChart;
