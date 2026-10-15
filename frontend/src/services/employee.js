import api from "./api";

// GET all
export const getEmployees = async () => {
  const res = await api.get("/getEmployee");
  return res.data;
};

// GET by employeeId
export const getEmployeeById = async (employeeId) => {
  const res = await api.post("/getEmployeeById", { employeeId });
  return res.data;
};

// CREATE
export const createEmployee = async (employeeData) => {
  const res = await api.post("/createEmployee", employeeData);
  return res.data;
};

// UPDATE
export const updateEmployee = async (employeeId, employeeData) => {
  const res = await api.post("/updateEmployee", {
    employeeId,
    ...employeeData   
  });
  return res.data;
};

// DELETE
export const deleteEmployee = async (employeeId) => {
  const res = await api.post("/deleteEmployee", {
    employeeId
  });
  return res.data;
};
