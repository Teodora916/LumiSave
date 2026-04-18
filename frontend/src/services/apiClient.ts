import axios from 'axios';
import { toast } from 'sonner';

const API_URL = 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    // Inject token if exists
    const token = localStorage.getItem('lumisave-auth')?.match(/"token":"(.*?)"/)?.[1];
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        // Implement token refresh or logout
        toast.error("Sesija je istekla. Molimo prijavite se ponovo.");
      } else if (status >= 400 && status < 500) {
        toast.error(data?.message || "Došlo je do greške u zahtevu.");
      } else if (status >= 500) {
        toast.error("Server greška, pokušajte ponovo kasnije.");
      }
    } else if (error.request) {
      toast.error("Proverite internet konekciju i da li je server dostupan.");
    }
    return Promise.reject(error);
  }
);
