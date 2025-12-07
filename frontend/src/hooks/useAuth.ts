'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import type { User, LoginResponse, ApiResponse } from '@/types';

// 缓存用户数据，避免每次 getSnapshot 返回新对象导致无限循环
let cachedUser: User | null = null;
let cachedUserJson: string | null = null;

// 简单的事件发射器，用于通知状态变化
let listeners: Array<() => void> = [];
function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(callback: () => void) {
  listeners = [...listeners, callback];
  return () => {
    listeners = listeners.filter(l => l !== callback);
  };
}

function getSnapshot(): User | null {
  if (typeof window === 'undefined') return null;
  
  const storedUserJson = localStorage.getItem('user');
  
  // 如果 JSON 字符串没变，返回缓存的对象（保持引用一致）
  if (storedUserJson === cachedUserJson) {
    return cachedUser;
  }
  
  // JSON 变了，更新缓存
  cachedUserJson = storedUserJson;
  if (storedUserJson) {
    try {
      cachedUser = JSON.parse(storedUserJson);
    } catch {
      localStorage.removeItem('user');
      cachedUser = null;
    }
  } else {
    cachedUser = null;
  }
  
  return cachedUser;
}

function getServerSnapshot(): User | null {
  return null;
}

// 更新 localStorage 并通知订阅者
function setStoredUser(user: User | null) {
  if (user) {
    const json = JSON.stringify(user);
    localStorage.setItem('user', json);
    cachedUserJson = json;
    cachedUser = user;
  } else {
    localStorage.removeItem('user');
    cachedUserJson = null;
    cachedUser = null;
  }
  emitChange();
}

export function useAuth() {
  // 使用 useSyncExternalStore 安全地同步 localStorage，避免 hydration 问题
  const user = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const router = useRouter();

  // 登录
  const login = useCallback(async (username: string, password: string) => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login/', {
      username,
      password,
    });
    
    const { token, user: userData } = response.data.data;
    localStorage.setItem('token', token);
    setStoredUser(userData);
    
    return userData;
  }, []);

  // 注册
  const register = useCallback(async (data: {
    username: string;
    password: string;
    confirm_password: string;
    full_name?: string;
    phone: string;
    bio?: string;
  }) => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/register/', data);
    
    const { token, user: userData } = response.data.data;
    localStorage.setItem('token', token);
    setStoredUser(userData);
    
    return userData;
  }, []);

  // 登出
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setStoredUser(null);
    router.push('/login');
  }, [router]);

  // 更新用户信息
  const updateProfile = useCallback(async (data: Partial<User>) => {
    const response = await api.put<ApiResponse<User>>('/auth/profile/', data);
    const updatedUser = response.data.data;
    setStoredUser(updatedUser);
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
    loading: false,  // useSyncExternalStore 是同步的，不需要 loading
    isAuthenticated: !!user,
    isAdmin: user?.user_type === 'admin',
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };
}

