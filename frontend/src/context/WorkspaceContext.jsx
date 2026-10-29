import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const WorkspaceContext = createContext();

export function WorkspaceProvider({ children }) {
  // mode: 'platform' | 'agency'
  // When agency: vendorId, vendorName, vendorCode
  const [workspace, setWorkspace] = useState(() => {
    const saved = localStorage.getItem("staffify_workspace");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      mode: "platform",
      vendorId: null,
      vendorName: "All Staffing Agencies (Platform)",
    };
  });

  useEffect(() => {
    localStorage.setItem("staffify_workspace", JSON.stringify(workspace));
  }, [workspace]);

  const switchToPlatform = () => {
    setWorkspace({
      mode: "platform",
      vendorId: null,
      vendorName: "All Staffing Agencies (Platform)",
    });
  };

  const switchToAgency = (vendor) => {
    setWorkspace({
      mode: "agency",
      vendorId: vendor.vendorId,
      vendorName: vendor.legalName,
      vendorCategory: vendor.category,
    });
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspace,
        isPlatformAdmin: workspace.mode === "platform",
        isAgencyWorkspace: workspace.mode === "agency",
        activeVendorId: workspace.vendorId,
        activeVendorName: workspace.vendorName,
        switchToPlatform,
        switchToAgency,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export const useWorkspace = () => useContext(WorkspaceContext);
