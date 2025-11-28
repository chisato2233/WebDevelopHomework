'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🤝</span>
            <span className="text-xl font-bold">好服务</span>
          </Link>

          {/* Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/dashboard"
                className="hover:text-blue-200 transition-colors"
              >
                首页
              </Link>
              <Link
                href="/needs"
                className="hover:text-blue-200 transition-colors"
              >
                浏览需求
              </Link>
              <Link
                href="/my-needs"
                className="hover:text-blue-200 transition-colors"
              >
                我需要
              </Link>
              <Link
                href="/my-responses"
                className="hover:text-blue-200 transition-colors"
              >
                我服务
              </Link>
              {isAdmin && (
                <Link
                  href="/statistics"
                  className="hover:text-blue-200 transition-colors"
                >
                  统计分析
                </Link>
              )}
            </nav>
          )}

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 hover:text-blue-200 transition-colors"
                >
                  <span className="text-lg">👤</span>
                  <span className="hidden sm:inline">{user?.full_name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                >
                  退出
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hover:text-blue-200 transition-colors"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  注册
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

