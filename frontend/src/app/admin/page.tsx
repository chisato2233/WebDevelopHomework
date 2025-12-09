'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  FileText,
  HandHelping,
  CheckCircle,
  TrendingUp,
  ArrowRight,
  BarChart3,
} from 'lucide-react';

interface OverviewData {
  total_users: number;
  total_needs: number;
  total_matches: number;
}

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await api.get('/statistics/overview/');
        if (response.data.code === 200) {
          setOverview(response.data.data);
        }
      } catch (error) {
        console.error('获取概览数据失败:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  const statCards = [
    {
      title: '注册用户',
      value: overview?.total_users || 0,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      title: '发布需求',
      value: overview?.total_needs || 0,
      icon: FileText,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
    },
    {
      title: '成功匹配',
      value: overview?.total_matches || 0,
      icon: CheckCircle,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
  ];

  const quickActions = [
    {
      title: '统计分析',
      description: '查看月度统计数据和趋势图表',
      icon: BarChart3,
      href: '/admin/statistics',
      required: true,
    },
    {
      title: '用户管理',
      description: '查看和管理所有用户信息',
      icon: Users,
      href: '/admin/users',
      required: false,
    },
    {
      title: '需求管理',
      description: '查看和管理所有服务需求',
      icon: FileText,
      href: '/admin/needs',
      required: false,
    },
    {
      title: '响应管理',
      description: '查看和管理所有服务响应',
      icon: HandHelping,
      href: '/admin/responses',
      required: false,
    },
  ];

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold">管理概览</h1>
        <p className="text-muted-foreground mt-1">
          查看平台整体运营数据
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className={`border ${stat.borderColor}`}>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className={`text-3xl font-bold ${stat.color}`}>
                      {stat.value.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 快捷操作 */}
      <div>
        <h2 className="text-xl font-semibold mb-4">功能模块</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Card
              key={action.href}
              className="group hover:shadow-md transition-all hover:border-primary/50"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <action.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {action.title}
                        {action.required ? (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                            必选
                          </span>
                        ) : (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            选作
                          </span>
                        )}
                      </CardTitle>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {action.description}
                </CardDescription>
                <Button variant="outline" size="sm" asChild className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Link href={action.href}>
                    进入模块
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 提示信息 */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">关于管理功能</h3>
              <p className="text-sm text-muted-foreground mt-1">
                根据课程要求，<strong>统计分析</strong>功能为必选实现项目，
                其他管理功能（用户管理、需求管理、响应管理）为选作项目。
                您可以根据需要选择实现。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
