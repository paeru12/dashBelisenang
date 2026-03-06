// lib/promotorApi.js
import api from "./axios";

const route = "/vi4/promotors";

export const registerPromotor = async (payload) => {
  const res = await api.post(`/auth/admin/register-promotor`, payload);

  return res.data;
};

export const getPromotorPagination = ({ page, perPage, search }) => {
  return api.get(route + "/pagination", {
    params: { page, perPage, search },
  });
};

export const getPromotorMembers = async () => {
  const res = await api.get(route);
  return res.data.data;
};

export const getScanStaffUsers = () =>
  api.get(`${route}/get-scann-staff`);

export const getOnePromotorMembers = async (id) => {
  const res = await api.get(`${route}/${id}`);
  return res.data.data;
};

export const createEventAdmin = async (payload) => {
  const res = await api.post(`${route}/event-admin`, payload);
  return res.data;
};

export const createScanStaff = async (payload) => {
  const res = await api.post(`${route}/scan-staff`, payload);
  return res.data;
};

export const updatePromotorMember = async (id, payload) => {
  const res = await api.put(`/vi4/promotors/${id}`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data.data;
};

export const updatePromotorPassword = async (id, payload) => {
  const res = await api.put(`${route}/update-password/${id}`, payload);
  return res.data;
};


export const deletePromotorMember = async (id) => {
  const res = await api.delete(`${route}/${id}`);
  return res.data;
};
