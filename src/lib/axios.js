import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
  },
});

api.interceptors.response.use(
  res=>res,
  async error=>{

    const originalRequest = error.config;

    if(error.response?.status !== 401){
      return Promise.reject(error);
    }

    if(originalRequest._retry){
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    await api.post("/auth/admin/refresh");

    return api(originalRequest);

  }
);

export default api;