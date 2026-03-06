import api from "./axios";
const route = "/vi4/creators";

export const getCreatorPagination = ({ page, perPage, search }) => {
  return api.get(route + "/pagination", {
    params: { page, perPage, search },
  });
};

export const getOneCreator = (id) => api.get(`${route}/${id}`);

export const createCreator = (formData) =>
  api.post(route, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateCreator = (id, formData) =>
  api.put(`${route}/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteCreator = (id) => api.delete(`${route}/${id}`);

/* =============================================================
   NEW ENDPOINTS
============================================================= */
export const getCreatorFinance = (id) =>
  api.get(`${route}/${id}/finance`);

export const updateCreatorFinance = (id, data) =>
  api.post(`${route}/${id}/finance`, data);

export const getCreatorDocuments = (id) =>
  api.get(`${route}/${id}/documents`);

export const getCreatorBankAccounts = (id) =>
  api.get(`${route}/${id}/bank-accounts`);