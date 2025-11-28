'use client';

import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PenSquare, Search, FileText, HandHelping, 
  Wrench, Heart, Sparkles, Hospital, UtensilsCrossed, Car 
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  const quickActions = [
    {
      title: '发布需求',
      description: '发布您的服务需求，让社区伙伴来帮助您',
      icon: PenSquare,
      href: '/my-needs/create',
      variant: 'default' as const,
    },
    {
      title: '浏览需求',
      description: '查看社区中的服务需求，提供您的帮助',
      icon: Search,
      href: '/needs',
      variant: 'secondary' as const,
    },
    {
      title: '我的需求',
      description: '管理您发布的服务需求',
      icon: FileText,
      href: '/my-needs',
      variant: 'outline' as const,
    },
    {
      title: '我的服务',
      description: '查看您提供的服务响应',
      icon: HandHelping,
      href: '/my-responses',
      variant: 'outline' as const,
    },
  ];

  const serviceTypes = [
    { name: '管道维修', icon: Wrench, color: 'bg-blue-500' },
    { name: '助老服务', icon: Heart, color: 'bg-pink-500' },
    { name: '保洁服务', icon: Sparkles, color: 'bg-green-500' },
    { name: '就诊服务', icon: Hospital, color: 'bg-red-500' },
    { name: '营养餐服务', icon: UtensilsCrossed, color: 'bg-orange-500' },
    { name: '定期接送', icon: Car, color: 'bg-purple-500' },
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome Banner */}
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">
                  欢迎回来，{user?.full_name} 👋
                </h1>
                <p className="text-muted-foreground mt-2">
                  在这里，您可以发布服务需求或为他人提供帮助
                </p>
              </div>
              <div className="hidden md:block">
                <Button asChild size="lg">
                  <Link href="/my-needs/create">
                    <PenSquare className="mr-2 h-5 w-5" />
                    发布需求
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">快速操作</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Card key={action.href} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <action.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">{action.description}</CardDescription>
                  <Button variant={action.variant} asChild className="w-full">
                    <Link href={action.href}>前往</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Service Types */}
        <div>
          <h2 className="text-xl font-semibold mb-4">服务类型</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {serviceTypes.map((service) => (
              <Link
                key={service.name}
                href={`/needs?service_type=${encodeURIComponent(service.name)}`}
              >
                <Card className="hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer">
                  <CardContent className="pt-6 text-center">
                    <div className={`inline-flex p-3 rounded-full ${service.color} mb-3`}>
                      <service.icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="font-medium">{service.name}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle>个人信息</CardTitle>
            <CardDescription>您的基本账户信息</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">用户名</p>
                <p className="font-medium">{user?.username}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">真实姓名</p>
                <p className="font-medium">{user?.full_name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">手机号码</p>
                <p className="font-medium">{user?.phone}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">用户类型</p>
                <Badge variant={user?.user_type === 'admin' ? 'default' : 'secondary'}>
                  {user?.user_type === 'admin' ? '管理员' : '普通用户'}
                </Badge>
              </div>
            </div>
            <div className="mt-6">
              <Button variant="outline" asChild>
                <Link href="/profile">编辑个人信息</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
