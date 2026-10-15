import api from "./api";

/**
 * Fetch salary structure for an employee
 */
export async function getSalaryStructure(employeeId) {
  const res = await api.get(`/api/payroll/salary-structure/${employeeId}`);
  return res.data;
}

/**
 * Save or update salary structure
 */
export async function saveSalaryStructure(data) {
  const res = await api.post("/api/payroll/salary-structure", data);
  return res.data;
}

/**
 * Run batch monthly payroll
 */
export async function runMonthlyPayroll(month, year, processedBy) {
  const res = await api.post("/api/payroll/run", { month, year, processedBy });
  return res.data;
}

/**
 * Get payslips list with optional filters
 */
export async function getPayslips(params = {}) {
  const res = await api.get("/api/payroll/payslips", { params });
  return res.data;
}

/**
 * Get individual payslip details
 */
export async function getPayslipById(payslipId) {
  const res = await api.get(`/api/payroll/payslips/${payslipId}`);
  return res.data;
}

/**
 * Update payslip status
 */
export async function updatePayslipStatus(payslipId, status) {
  const res = await api.patch(`/api/payroll/payslips/${payslipId}/status`, { status });
  return res.data;
}

/**
 * Get payroll summary metrics
 */
export async function getPayrollSummary(month, year) {
  const res = await api.get("/api/payroll/summary", { params: { month, year } });
  return res.data;
}
