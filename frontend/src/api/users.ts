import { apiClient } from './client';
import { User, UserStats } from '../types/user';

export const usersApi = {
  getProfile: async (): Promise<User> => {
    const res = await apiClient.get<User>('/users/me');
    return res.data;
  },

  updateProfile: async (data: { name?: string; avatarUrl?: string }): Promise<User> => {
    const res = await apiClient.patch<User>('/users/me', data);
    return res.data;
  },

  getUserStats: async (): Promise<UserStats> => {
    const res = await apiClient.get<UserStats>('/users/me/stats');
    return res.data;
  },
};

