'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  FileText,
  HandHelping,
  Settings,
  ArrowLeft,
  Shield,
  Loader2,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const sidebarNavItems = [
  {
    title: '概览',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: '统计分析',
    href: '/admin/statistics',
    icon: BarChart3,
  },
  {
    title: '用户管理',
    href: '/admin/users',
    icon: Users,
    badge: '选作',
  },
  {
    title: '需求管理',
    href: '/admin/needs',
    icon: FileText,
    badge: '选作',
  },
  {
    title: '响应管理',
    href: '/admin/responses',
    icon: HandHelping,
    badge: '选作',
  },
  {
    title: '系统设置',
    href: '/admin/settings',
    icon: Settings,
    badge: '选作',
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // 检查权限
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.user_type !== 'admin') {
        toast.error('您没有管理员权限');
        router.push('/dashboard');
      }
    }
  }, [user, isAuthenticated, loading, router]);

  // 加载中
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  // 非管理员
  if (!user || user.user_type !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">验证权限中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部栏 */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4 gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回主站
            </Link>
          </Button>

          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold text-lg">管理控制台</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              管理员：{user.full_name || user.username}
            </span>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* 侧边栏 */}
        <aside className="hidden md:flex w-64 flex-col border-r bg-muted/30 min-h-[calc(100vh-3.5rem)]">
          <ScrollArea className="flex-1 py-4">
            <nav className="grid gap-1 px-3">
              {sidebarNavItems.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/admin' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="flex-1">{item.title}</span>
                    {item.badge && (
                      <span className={cn(
                        'text-xs px-1.5 py-0.5 rounded',
                        isActive
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : 'bg-muted-foreground/20 text-muted-foreground'
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* 侧边栏底部信息 */}
          <div className="border-t p-4">
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground">
                好服务管理系统 v1.0
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                标记&quot;选作&quot;的功能为可选实现
              </p>
            </div>
          </div>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 min-h-[calc(100vh-3.5rem)]">
          <div className="container py-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      <Toaster />
    </div>
  );
}
