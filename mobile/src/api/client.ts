import axios from "axios";
import config from "../constants/config";
import { useAuthStore } from "../store/auth.store";

const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((reqConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    reqConfig.headers.Authorization = `Bearer ${token}`;
  }
  return reqConfig;
});

export default apiClient;
