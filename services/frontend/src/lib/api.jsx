import axios from "axios";

//backend url comes from VITE_API_URL, falls back to local dev
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("mediq_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("mediq_token");
      localStorage.removeItem("mediq_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

//get the error message out of the backend error response
export function getErrorMessage(err, fallback = "Something went wrong.") {
  return err.response?.data?.error?.message || fallback;
}
