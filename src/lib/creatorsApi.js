// lib/creatorApi.js
import api from "./axios";

export const fetcher = (url) => api.get(url).then((res) => res.data);

const base = "/vi4/creators";

export const creatorApi = {
  paginated: (page, perPage, search) =>
    `${base}/pagination?page=${page}&perPage=${perPage}&search=${search}`,

  documents: (id) => `${base}/${id}/documents`,
  finance: (id) => `${base}/${id}/finance`,
  bank: (id) => `${base}/${id}/bank-accounts`,

  updateFinance: (id, data) => api.post(`${base}/${id}/finance`, data),
  delete: (id) => api.delete(`${base}/${id}`)
};