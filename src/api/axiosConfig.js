import axios from "axios";

// Change this if your Spring Boot backend runs on a different host/port
const BASE_URL = "http://localhost:8080/api";

const api = axios.create({
  baseURL: BASE_URL,
});

// Attach JWT token to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("medicnote_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is invalid/expired, log the user out
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("medicnote_token");
      localStorage.removeItem("medicnote_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
