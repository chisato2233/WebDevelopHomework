'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Construction } from 'lucide-react';

export default function AdminNeedsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">需求管理</h1>
        <p className="text-muted-foreground mt-1">
          查看和管理所有服务需求
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
              <FileText className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">需求管理功能</h3>
            <p className="text-muted-foreground max-w-md">
              根据课程要求，此功能为选作项目。实现后将支持：
            </p>
            <ul className="text-sm text-muted-foreground mt-4 space-y-1">
              <li>• 查询一定条件的"我需要"状态信息列表</li>
              <li>• 点击某一服务需求标识可显示发布者的用户信息</li>
              <li>• 需求状态管理</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
