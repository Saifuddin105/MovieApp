import { apiClient, setApiAccessToken } from './client';
import { AuthResponse, User } from '../types/user';

export const authApi = {
  register: async (data: { name: string; email: string; password: string }): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/register', data);
    setApiAccessToken(res.data.accessToken);
    if (res.data.refreshToken) {
      localStorage.setItem('refreshToken', res.data.refreshToken);
    }
    return res.data;
  },

  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', data);
    setApiAccessToken(res.data.accessToken);
    if (res.data.refreshToken) {
      localStorage.setItem('refreshToken', res.data.refreshToken);
    }
    return res.data;
  },

  googleLogin: async (data: {
    idToken: string;
    demoUser?: { email: string; name: string; picture?: string };
  }): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/google', data);
    setApiAccessToken(res.data.accessToken);
    if (res.data.refreshToken) {
      localStorage.setItem('refreshToken', res.data.refreshToken);
    }
    return res.data;
  },

  logout: async (): Promise<{ success: boolean; message: string }> => {
    const storedRefreshToken = localStorage.getItem('refreshToken');
    try {
      const res = await apiClient.post<{ success: boolean; message: string }>('/auth/logout', {
        refreshToken: storedRefreshToken,
      });
      return res.data;
    } finally {
      setApiAccessToken(null);
      localStorage.removeItem('refreshToken');
    }
  },

  getMe: async (): Promise<User> => {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },
};

