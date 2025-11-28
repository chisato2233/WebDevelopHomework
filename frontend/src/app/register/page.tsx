'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '@/lib/validation';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password', '');

  // 密码强度检查
  const passwordChecks = {
    length: password.length >= 6,
    digits: (password.match(/\d/g) || []).length >= 2,
    mixed: /[A-Z]/.test(password) && /[a-z]/.test(password),
  };

  const onSubmit = async (data: RegisterFormData) => {
    setError('');
    setLoading(true);
    try {
      await registerUser({
        username: data.username,
        password: data.password,
        full_name: data.full_name,
        phone: data.phone,
        bio: data.bio,
      });
      router.push('/dashboard');
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      if (errors?.username) {
        setError('用户名已存在');
      } else {
        setError(err.response?.data?.message || '注册失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-5xl">🤝</span>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">好服务平台</h1>
          <p className="mt-2 text-gray-600">加入我们，共建美好社区</p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-center mb-6">用户注册</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                用户名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('username')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入用户名"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                密码 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                {...register('password')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入密码"
              />
              {/* 密码强度提示 */}
              <div className="mt-2 space-y-1 text-sm">
                <p className={passwordChecks.length ? 'text-green-600' : 'text-gray-400'}>
                  {passwordChecks.length ? '✓' : '○'} 至少6位
                </p>
                <p className={passwordChecks.digits ? 'text-green-600' : 'text-gray-400'}>
                  {passwordChecks.digits ? '✓' : '○'} 包含至少2个数字
                </p>
                <p className={passwordChecks.mixed ? 'text-green-600' : 'text-gray-400'}>
                  {passwordChecks.mixed ? '✓' : '○'} 包含大写和小写字母
                </p>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                确认密码 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                {...register('confirmPassword')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请再次输入密码"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                真实姓名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('full_name')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入真实姓名"
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-500">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                手机号码 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                {...register('phone')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入11位手机号码"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                个人简介
              </label>
              <textarea
                {...register('bio')}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="介绍一下自己（选填）"
              />
              {errors.bio && (
                <p className="mt-1 text-sm text-red-500">{errors.bio.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '注册中...' : '立即注册'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-gray-600">已有账号？</span>
            <Link href="/login" className="ml-2 text-blue-600 hover:underline">
              立即登录
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

