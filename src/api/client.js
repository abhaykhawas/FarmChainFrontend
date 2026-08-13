import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "https://farmchainbackend.onrender.com/api";
export const SERVER_URL = import.meta.env.VITE_SERVER_URL || "https://farmchainbackend.onrender.com";

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("farmchain_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem("farmchain_token")) {
      window.dispatchEvent(new Event("farmchain:unauthorized"));
    }
    return Promise.reject(error);
  },
);

export function apiError(error, fallback = "Something went wrong. Please try again.") {
  if (error.code === "ECONNABORTED") return "The request timed out. Is the backend running on port 5002?";
  if (!error.response) return "Could not connect to FarmChain. Make sure the server is running on port 5002.";
  return error.response?.data?.message || fallback;
}

export function assetUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${SERVER_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export default api;
