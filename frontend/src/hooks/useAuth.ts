'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import type { User, LoginResponse, ApiResponse } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 初始化时从 localStorage 恢复用户状态
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // 登录
  const login = useCallback(async (username: string, password: string) => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login/', {
      username,
      password,
    });
    
    const { token, user: userData } = response.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    
    return userData;
  }, []);

  // 注册
  const register = useCallback(async (data: {
    username: string;
    password: string;
    full_name: string;
    phone: string;
    bio?: string;
  }) => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/register/', data);
    
    const { token, user: userData } = response.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    
    return userData;
  }, []);

  // 登出
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  }, [router]);

  // 更新用户信息
  const updateProfile = useCallback(async (data: Partial<User>) => {
    const response = await api.put<ApiResponse<User>>('/auth/profile/', data);
    const updatedUser = response.data.data;
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    return updatedUser;
  }, []);

  // 修改密码
  const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    await api.post('/auth/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
    });
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.user_type === 'admin',
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };
}

