'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Construction } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">系统设置</h1>
        <p className="text-muted-foreground mt-1">
          管理系统配置和参数
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="h-5 w-5 text-yellow-500" />
            功能开发中
          </CardTitle>
          <CardDescription>
            此功能为选作内容，尚未实现
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <Settings className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">系统设置功能</h3>
            <p className="text-muted-foreground max-w-md">
              此功能为扩展项目。实现后将支持：
            </p>
            <ul className="text-sm text-muted-foreground mt-4 space-y-1">
              <li>• 系统参数配置</li>
              <li>• 服务类型管理</li>
              <li>• 地域信息管理</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
