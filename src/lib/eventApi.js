import api from "./axios";
const route = "/vi4/events";

export const getEvents = async ({ page, perPage, search }) => {
  const res = await api.get(route + "/pagination", {
    params: { page, perPage, search },
  });

  return {
    events: res.data.data ?? [],
    meta: res.data.meta ?? null,
    media: res.data.media,
  };
};

export const getAllEventByCreator = async () => {
  const res = await api.get(route);
  return res.data.data;
};

export const getEvent = async (id) => {
  const res = await api.get(`${route}/${id}`);
  return res.data;
};

export const createEvents = (formData) => {
  return api.post(route + "/create-all", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    },
  });
};

export const updateEvents = (id, formData) => {
  return api.put(`${route}/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    },
  });
};

export const deleteEvents = (id) => {
  return api.delete(`${route}/${id}`);
};
