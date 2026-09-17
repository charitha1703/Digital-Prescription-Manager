import api from "./axiosConfig";

export async function changePassword(oldPassword, newPassword) {
  const res = await api.put("/auth/change-password", { oldPassword, newPassword });
  return res.data;
}