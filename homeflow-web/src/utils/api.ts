import axios, { type AxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach auth token
apiClient.interceptors.request.use((config) => {
  const raw = localStorage.getItem('homeflow-auth');
  if (raw) {
    try {
      const { state } = JSON.parse(raw);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    } catch {
      // ignore parse errors
    }
  }
  return config;
});

// Response interceptor: unwrap data / handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('homeflow-auth');
      window.location.href = '/welcome';
    }
    return Promise.reject(error);
  },
);

export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.get<T>(url, config);
  return res.data;
}

export async function post<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await apiClient.post<T>(url, data, config);
  return res.data;
}

export async function put<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await apiClient.put<T>(url, data, config);
  return res.data;
}

export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.delete<T>(url, config);
  return res.data;
}
