import axios from "axios";
import { useWakeStore } from "./wakeStore";

//backend url comes from VITE_API_URL, falls back to local dev
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

//how long a request can take before the wake up notice shows
const SLOW_REQUEST_MS = 3000;

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("mediq_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.slowTimer = setTimeout(() => {
    config.markedSlow = true;
    useWakeStore.getState().addSlow();
  }, SLOW_REQUEST_MS);
  return config;
});

//request finished either way, stop the timer and hide the notice if this one showed it
function settleRequest(config) {
  if (!config) return;
  clearTimeout(config.slowTimer);
  if (config.markedSlow) {
    config.markedSlow = false;
    useWakeStore.getState().removeSlow();
  }
}

api.interceptors.response.use(
  (response) => {
    settleRequest(response.config);
    return response;
  },
  (error) => {
    settleRequest(error.config);
    if (error.response?.status === 401) {
      localStorage.removeItem("mediq_token");
      localStorage.removeItem("mediq_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

//free hosting sleeps when idle, so start waking the backend as soon as the app opens
export function warmUpServer() {
  axios.get(`${API_URL}/warmup`).catch(() => {});
}

//get the error message out of the backend error response
export function getErrorMessage(err, fallback = "Something went wrong.") {
  return err.response?.data?.error?.message || fallback;
}
