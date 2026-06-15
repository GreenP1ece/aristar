import axios from 'axios';
import keycloak from '../keycloak';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5164',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  if (keycloak.token) {
    await keycloak.updateToken(30).catch(() => keycloak.logout());
    config.headers.Authorization = `Bearer ${keycloak.token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      keycloak.login();
    }
    return Promise.reject(error);
  }
);

export default apiClient;