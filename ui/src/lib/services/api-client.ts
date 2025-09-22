import axios from 'axios';
import { getSession } from './auth';

const AUTH_BASE_URL = process.env.NEXT_PUBLIC_AUTH_PROVIDER_URL || "http://localhost:5006/api";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5196/api";

const baseConfig = {
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
};

// Auth client (no interceptor needed)
export const authClient = axios.create({
  ...baseConfig,
  baseURL: AUTH_BASE_URL
});

// API client WITHOUT session interceptor (for client components)
export const apiClient = axios.create({
  ...baseConfig,
  baseURL: API_BASE_URL
});

// Server-side API helper that adds token manually
export async function serverApi() {
  const session = await getSession();
  
  return axios.create({
    ...baseConfig,
    baseURL: API_BASE_URL,
    headers: {
      ...baseConfig.headers,
      ...(session?.accessToken && {
        Authorization: `Bearer ${session.accessToken}`
      })
    }
  });
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  userType: 'Superuser' | 'Admin' | 'Student' | 'Parent';
  phoneNumber?: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    userName: string;
    phoneNumber?: string;
    roles?: string[] | null;
  };
  token: string;
  expires: string;
  message: string;
}

export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await authClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await authClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },
};

// Server-side API helper functions
export const api = {
  get: async <T>(url: string): Promise<T> => {
    const client = await serverApi();
    const response = await client.get<T>(url);
    return response.data;
  },
  post: async <T>(url: string, data?: any): Promise<T> => {
    const client = await serverApi();
    const response = await client.post<T>(url, data);
    return response.data;
  },
  put: async <T>(url: string, data?: any): Promise<T> => {
    const client = await serverApi();
    const response = await client.put<T>(url, data);
    return response.data;
  },
  delete: async <T>(url: string): Promise<T> => {
    const client = await serverApi();
    const response = await client.delete<T>(url);
    return response.data;
  },
};