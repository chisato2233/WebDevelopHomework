'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import api from '@/lib/api';
import type { ServiceResponse } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Clock, Pencil, Trash2, ExternalLink, ImageIcon, VideoIcon } from 'lucide-react';

const STATUS_CONFIG: Record<number, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  0: { label: '待接受', variant: 'outline' },
  1: { label: '已同意', variant: 'default' },
  2: { label: '已拒绝', variant: 'destructive' },
  3: { label: '已取消', variant: 'secondary' },
};

export default function MyResponsesPage() {
  const [responses, setResponses] = useState<ServiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchMyResponses = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const response = await api.get('/responses/my/', { params });
      setResponses(response.data.results || response.data);
    } catch (error) {
      console.error('获取我的响应失败:', error);
      toast.error('获取响应列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyResponses();
  }, [statusFilter]);

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/responses/${id}/`);
      toast.success('响应已取消');
      fetchMyResponses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || '操作失败');
    }
  };

  const ResponseCard = ({ response }: { response: ServiceResponse }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={STATUS_CONFIG[response.status]?.variant}>
                {STATUS_CONFIG[response.status]?.label}
              </Badge>
              <Badge variant="secondary">{response.need?.service_type}</Badge>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">响应需求</p>
              <Link
                href={`/needs/${response.need?.id}`}
                className="text-lg font-semibold hover:text-primary transition-colors flex items-center gap-1"
              >
                {response.need?.title}
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
            
            <p className="text-muted-foreground line-clamp-2">
              {response.description}
            </p>

            {/* 显示图片/视频数量 */}
            {((response.images && response.images.length > 0) || (response.videos && response.videos.length > 0)) && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {response.images && response.images.length > 0 && (
                  <span className="flex items-center gap-1">
                    <ImageIcon className="h-4 w-4" />
                    {response.images.length} 张图片
                  </span>
                )}
                {response.videos && response.videos.length > 0 && (
                  <span className="flex items-center gap-1">
                    <VideoIcon className="h-4 w-4" />
                    {response.videos.length} 个视频
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              提交时间：{new Date(response.created_at).toLocaleString()}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/needs/${response.need?.id}`}>查看需求</Link>
            </Button>
            
            {response.status === 0 && (
              <>
                <Button variant="outline" asChild>
                  <Link href={`/my-responses/${response.id}/edit`}>
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
                      <AlertDialogTitle>确认取消</AlertDialogTitle>
                      <AlertDialogDescription>
                        确定要取消这条响应吗？此操作无法撤销。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>返回</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(response.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        确认取消
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
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">我的服务响应</h1>
          <p className="text-muted-foreground mt-1">查看和管理您提交的所有服务响应</p>
        </div>

        {/* Tabs */}
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="0">待接受</TabsTrigger>
            <TabsTrigger value="1">已同意</TabsTrigger>
            <TabsTrigger value="2">已拒绝</TabsTrigger>
          </TabsList>

          <TabsContent value={statusFilter} className="mt-6">
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
            ) : responses.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4 text-muted-foreground">
                      <Clock className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium">暂无响应记录</h3>
                    <p className="text-muted-foreground mt-1 mb-4">
                      浏览需求，为他人提供您的帮助
                    </p>
                    <Button asChild>
                      <Link href="/needs">浏览需求</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {responses.map((response) => (
                  <ResponseCard key={response.id} response={response} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
