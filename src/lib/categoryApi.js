import api from "./axios";
const route = '/vi4/kategoris';

export const getCategory = () => {
    return api.get(route);
}

export const getCategories = ({ page, perPage, search }) => {
  return api.get(route + "/pagination", {
    params: { page, perPage, search },
  });
};

// CREATE
export const createCategory = (formData) => {
  return api.post(route, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    },
  });
};

// UPDATE
export const updateCategory = (id, formData) => {
  return api.put(`${route}/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    },
  });
};

// DELETE (nanti dipakai)
export const deleteCategory = (id) => {
  return api.delete(`${route}/${id}`);
};
