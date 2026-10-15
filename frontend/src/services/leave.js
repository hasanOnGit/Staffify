import api from "./api";

/* =============================
   GET ALL LEAVES
============================= */
export const getLeaves = async () => {
  const res = await api.get("/getLeaves");
  return res.data.data;   // return only array
};

/* =============================
   APPLY LEAVE
============================= */
export const createLeave = async (leaveData) => {
  const res = await api.post("/applyLeave", leaveData);
  return res.data;
};

/* =============================
   UPDATE LEAVE (Approve/Reject)
============================= */
export const updateLeave = async (leaveId, status, approvedBy) => {
  const res = await api.post("/updateLeave", {
    leaveId,
    status,
    approvedBy
  });

  return res.data;
};

/* =============================
   DELETE LEAVE
============================= */
export const deleteLeave = async (leaveId) => {
  const res = await api.post("/deleteLeave", {
    leaveId
  });

  return res.data;
};
