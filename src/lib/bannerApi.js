// /lib/bannerApi.js
import api from "./axios";

const route = "/vi4/banners";

// GET PAGINATION
export const getBanners = ({ page, perPage, search }) => {
  return api.get(route + "/pagination", {
    params: { page, perPage, search },
  });
};

// GET SINGLE (optional)
export const getBanner = (id) => {
  return api.get(`${route}/${id}`);
};

// CREATE
export const createBanner = (formData) => {
  return api.post(route, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// UPDATE
export const updateBanner = (id, formData) => {
  return api.put(`${route}/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// DELETE
export const deleteBanner = (id) => {
  return api.delete(`${route}/${id}`);
};
