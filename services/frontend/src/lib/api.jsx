import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000/api/v1",
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
