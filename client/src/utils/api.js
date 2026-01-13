import axios from "axios";
import { store } from "../redux/store";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true,
});

// Add a request interceptor that reads token from Redux store on EVERY request
api.interceptors.request.use(
  (config) => {
    // Get fresh token from Redux store
    const state = store.getState();
    const user = state.auth.user;

    // Attach token if it exists
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
