import api from "./axios";
const route = '/vi4/fasilitas';

export const getFasilitas = ({ page, perPage, search }) => {
  return api.get(route + "/pagination", {
    params: { page, perPage, search },
  });
};

export const getAllFasilitas = () => {
    return api.get(route);
}

export const createFasilitas = (formData) => {
  return api.post(route, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    },
  });
};

export const updateFasilitas = (id, formData) => {
  return api.put(`${route}/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    },
  });
};

export const deleteFasilitas = (id) => {
  return api.delete(`${route}/${id}`);
};
