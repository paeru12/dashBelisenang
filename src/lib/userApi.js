import api from "./axios";

const route = "/vi4/users";
export const getUserPagination = ({ page, perPage, search }) => {
  return api.get(route + "/pagination", {
    params: { page, perPage, search },
  });
};

export const getOneUser = async (id) => {
  const res = await api.get(`${route}/${id}`);
  return res.data.data;
};

export const createUser = async (payload) => {
  const res = await api.post(`${route}`, payload);
  return res.data;
};

export const updateUser = async (id, payload) => {
  const res = await api.put(`${route}/${id}`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
    return res.data.data;
};

export const updateUserPassword = async (id, payload) => {
  const res = await api.put(`${route}/update-password/${id}`, payload);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await api.delete(`${route}/${id}`);
  return res.data;
};