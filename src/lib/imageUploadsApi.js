import api from "./axios";

export const imageUpload = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const res = await api.post("/vi4/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.url;
};