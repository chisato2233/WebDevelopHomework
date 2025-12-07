'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import type { User, LoginResponse, ApiResponse } from '@/types';

// 追踪是否已在客户端挂载
let isMounted = false;

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
  
  // 首次订阅时标记为已挂载，并触发更新
  if (!isMounted) {
    isMounted = true;
    // 延迟触发以确保 React 完成当前渲染
    setTimeout(emitChange, 0);
  }
  
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

// 服务端快照 - 服务器没有 localStorage，只能返回 null
function getServerSnapshot(): User | null {
  return null;
}

// 获取 loading 状态的快照
function getMountedSnapshot(): boolean {
  return isMounted;
}

function getServerMountedSnapshot(): boolean {
  return false;  // 服务端永远是 "加载中"
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
  const mounted = useSyncExternalStore(subscribe, getMountedSnapshot, getServerMountedSnapshot);
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
    loading: !mounted,  // 客户端挂载前为 true，挂载后为 false
    isAuthenticated: !!user,
    isAdmin: user?.user_type === 'admin',
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };
}

