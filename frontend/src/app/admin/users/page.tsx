'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Construction } from 'lucide-react';

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">用户管理</h1>
        <p className="text-muted-foreground mt-1">
          查看和管理所有注册用户
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
              <Users className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">用户管理功能</h3>
            <p className="text-muted-foreground max-w-md">
              根据课程要求，此功能为选作项目。实现后将支持：
            </p>
            <ul className="text-sm text-muted-foreground mt-4 space-y-1">
              <li>• 查询当前所有用户基本信息</li>
              <li>• 查看用户详细资料</li>
              <li>• 用户状态管理</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
