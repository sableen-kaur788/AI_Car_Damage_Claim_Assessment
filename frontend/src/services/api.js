import axios from "axios";
import { clearSession, getRefreshToken, getToken, setSession } from "./auth";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000",
});

let refreshPromise = null;

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest?._retry && getRefreshToken()) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = axios.post(`${api.defaults.baseURL}/auth/refresh`, {
            refresh_token: getRefreshToken(),
          });
        }

        const refreshResponse = await refreshPromise;
        refreshPromise = null;
        setSession(
          refreshResponse.data.access_token,
          refreshResponse.data.refresh_token,
          refreshResponse.data.user
        );
        originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        refreshPromise = null;
        clearSession();
      }
    }

    if (error.response?.status === 401) {
      clearSession();
      if (!["/login", "/signup", "/forgot-password", "/reset-password"].includes(window.location.pathname)) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
