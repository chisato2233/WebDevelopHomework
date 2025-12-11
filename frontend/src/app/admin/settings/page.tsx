'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, MapPin, ArrowRight, Wrench } from 'lucide-react';

const settingsModules = [
  {
    title: '地域管理',
    description: '管理系统中的省份、城市、区县等地域信息',
    icon: MapPin,
    href: '/admin/regions',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    title: '服务类型管理',
    description: '管理系统中的服务类型分类（开发中）',
    icon: Wrench,
    href: '#',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    disabled: true,
  },
];

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">系统设置</h1>
        <p className="text-muted-foreground mt-1">
          管理系统配置和参数
        </p>
      </div>

      {/* 设置模块 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settingsModules.map((module) => (
          <Card
            key={module.title}
            className={`group transition-all ${module.disabled ? 'opacity-60' : 'hover:shadow-md hover:border-primary/50'}`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${module.bgColor} ${!module.disabled && 'group-hover:scale-110'} transition-transform`}>
                    <module.icon className={`h-5 w-5 ${module.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                {module.description}
              </CardDescription>
              {module.disabled ? (
                <Button variant="outline" size="sm" disabled>
                  开发中
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                >
                  <Link href={module.href}>
                    进入管理
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 系统信息 */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5" />
            系统信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">系统版本</p>
              <p className="font-medium">Nexus v1.0.0</p>
            </div>
            <div>
              <p className="text-muted-foreground">前端框架</p>
              <p className="font-medium">Next.js 15 + React 19</p>
            </div>
            <div>
              <p className="text-muted-foreground">后端框架</p>
              <p className="font-medium">Django 5.0 + DRF</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
