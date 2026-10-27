import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types/user';
import { authApi } from '../api/auth';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  register: (data: { name: string; email: string; password: string }) => Promise<User>;
  loginWithGoogle: (data: {
    idToken: string;
    demoUser?: { email: string; name: string; picture?: string };
  }) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authApi.getMe();
      setUser(currentUser);
    } catch (err) {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      // Attempt to load current user if token exists or cookies present
      if (storedRefreshToken || document.cookie.includes('access_token')) {
        await refreshUser();
      }
      setIsLoading(false);
    };

    initAuth();
  }, [refreshUser]);

  const login = async (credentials: { email: string; password: string }): Promise<User> => {
    const res = await authApi.login(credentials);
    setUser(res.user);
    toast.success(`Welcome back, ${res.user.name}!`);
    return res.user;
  };

  const register = async (data: { name: string; email: string; password: string }): Promise<User> => {
    const res = await authApi.register(data);
    setUser(res.user);
    toast.success(`Welcome to What Should I Watch Tonight, ${res.user.name}!`);
    return res.user;
  };

  const loginWithGoogle = async (data: {
    idToken: string;
    demoUser?: { email: string; name: string; picture?: string };
  }): Promise<User> => {
    const res = await authApi.googleLogin(data);
    setUser(res.user);
    toast.success(`Signed in with Google as ${res.user.name}!`);
    return res.user;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // Continue client logout even if backend token already expired
    } finally {
      setUser(null);
      toast.info('You have been logged out.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        loginWithGoogle,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

