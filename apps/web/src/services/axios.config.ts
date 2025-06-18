import axios from "axios";
import { env } from "../config/env";

const axiosInstance = axios.create({
  baseURL: env.apiUrl,
});

// Add request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    console.log('Request headers:', config.headers);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response from:', response.config.url);
    console.log('Response status:', response.status);
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    console.error('Error config:', error.config);
    console.error('Error response:', error.response);
    return Promise.reject(error);
  }
);

export default axiosInstance;
