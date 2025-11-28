'use client';

import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();

  const quickActions = [
    {
      title: '发布需求',
      description: '发布您的服务需求，让社区伙伴来帮助您',
      icon: '📝',
      href: '/my-needs/create',
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: '浏览需求',
      description: '查看社区中的服务需求，提供您的帮助',
      icon: '🔍',
      href: '/needs',
      color: 'from-green-500 to-green-600',
    },
    {
      title: '我的需求',
      description: '管理您发布的服务需求',
      icon: '📋',
      href: '/my-needs',
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: '我的服务',
      description: '查看您提供的服务响应',
      icon: '🤝',
      href: '/my-responses',
      color: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold">
            欢迎回来，{user?.full_name} 👋
          </h1>
          <p className="mt-2 text-blue-100">
            在这里，您可以发布服务需求或为他人提供帮助
          </p>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">快速操作</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <div className={`bg-gradient-to-r ${action.color} p-4`}>
                  <span className="text-4xl">{action.icon}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {action.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Service Types */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">服务类型</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: '管道维修', icon: '🔧' },
              { name: '助老服务', icon: '👴' },
              { name: '保洁服务', icon: '🧹' },
              { name: '就诊服务', icon: '🏥' },
              { name: '营养餐服务', icon: '🍱' },
              { name: '定期接送', icon: '🚗' },
            ].map((service) => (
              <Link
                key={service.name}
                href={`/needs?service_type=${encodeURIComponent(service.name)}`}
                className="bg-white rounded-xl p-4 text-center shadow hover:shadow-md transition-shadow"
              >
                <span className="text-3xl">{service.icon}</span>
                <p className="mt-2 text-sm font-medium text-gray-700">
                  {service.name}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">个人信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">用户名</p>
              <p className="font-medium">{user?.username}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">真实姓名</p>
              <p className="font-medium">{user?.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">手机号码</p>
              <p className="font-medium">{user?.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">用户类型</p>
              <p className="font-medium">
                {user?.user_type === 'admin' ? '管理员' : '普通用户'}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/profile"
              className="text-blue-600 hover:underline text-sm"
            >
              编辑个人信息 →
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

