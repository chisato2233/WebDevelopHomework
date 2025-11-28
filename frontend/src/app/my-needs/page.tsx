'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import api from '@/lib/api';
import type { Need } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Plus, MapPin, Clock, MessageSquare, Pencil, Trash2 } from 'lucide-react';

export default function MyNeedsPage() {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyNeeds = async () => {
    setLoading(true);
    try {
      const response = await api.get('/needs/my/');
      setNeeds(response.data.results || response.data);
    } catch (error) {
      console.error('获取我的需求失败:', error);
      toast.error('获取需求列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyNeeds();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/needs/${id}/`);
      toast.success('需求删除成功');
      fetchMyNeeds();
    } catch (error: any) {
      toast.error(error.response?.data?.message || '删除失败');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">我的需求</h1>
            <p className="text-muted-foreground mt-1">管理您发布的服务需求</p>
          </div>
          <Button asChild>
            <Link href="/my-needs/create">
              <Plus className="mr-2 h-4 w-4" />
              发布新需求
            </Link>
          </Button>
        </div>

        {/* Needs List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : needs.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-lg font-medium">您还没有发布任何需求</h3>
                <p className="text-muted-foreground mt-1 mb-4">
                  发布第一条需求，让社区伙伴来帮助您
                </p>
                <Button asChild>
                  <Link href="/my-needs/create">
                    <Plus className="mr-2 h-4 w-4" />
                    发布第一条需求
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {needs.map((need) => (
              <Card key={need.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge>{need.service_type}</Badge>
                        <Badge variant={need.status === 0 ? 'default' : 'secondary'}>
                          {need.status === 0 ? '已发布' : '已取消'}
                        </Badge>
                        {need.response_count && need.response_count > 0 && (
                          <Badge variant="destructive" className="animate-pulse">
                            <MessageSquare className="mr-1 h-3 w-3" />
                            {need.response_count} 条新响应
                          </Badge>
                        )}
                      </div>
                      
                      <Link
                        href={`/needs/${need.id}`}
                        className="block text-xl font-semibold hover:text-primary transition-colors"
                      >
                        {need.title}
                      </Link>
                      
                      <p className="text-muted-foreground line-clamp-2">
                        {need.description}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {need.region?.full_name || '未知地区'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(need.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" asChild>
                        <Link href={`/needs/${need.id}`}>查看</Link>
                      </Button>
                      
                      {need.status === 0 && (!need.response_count || need.response_count === 0) && (
                        <>
                          <Button variant="outline" asChild>
                            <Link href={`/my-needs/${need.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>确认删除</AlertDialogTitle>
                                <AlertDialogDescription>
                                  确定要删除这条需求吗？此操作无法撤销。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(need.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  删除
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
