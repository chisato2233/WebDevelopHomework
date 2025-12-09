'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import type { ServiceResponse } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  ArrowLeft,
  User as UserIcon,
  Clock,
  Phone,
  Image as ImageIcon,
  Video,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { ReactNextPlayer } from 'reactnextplayer';

export default function AdminResponseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [response, setResponse] = useState<ServiceResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // 获取响应详情
  const fetchResponse = async () => {
    try {
      const res = await api.get(`/responses/admin/${params.id}/`);
      if (res.data.code === 200) {
        setResponse(res.data.data);
      } else {
        toast.error(res.data.message || '获取响应详情失败');
      }
    } catch (error: any) {
      console.error('获取响应详情失败:', error);
      toast.error(error.response?.data?.message || '获取响应详情失败');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchResponse();
      setLoading(false);
    };
    loadData();
  }, [params.id]);

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 获取响应状态徽章
  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <Badge variant="outline" className="border-blue-500 text-blue-500">待接受</Badge>;
      case 1:
        return <Badge variant="outline" className="border-green-500 text-green-500">已同意</Badge>;
      case 2:
        return <Badge variant="outline" className="border-red-500 text-red-500">已拒绝</Badge>;
      case 3:
        return <Badge variant="outline" className="border-gray-500 text-gray-500">已取消</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  // 获取响应状态图标
  const getStatusIcon = (status: number) => {
    switch (status) {
      case 0:
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case 1:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 2:
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 3:
        return <XCircle className="h-5 w-5 text-gray-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">响应不存在</h2>
        <Button className="mt-4" onClick={() => router.push('/admin/responses')}>
          返回响应列表
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 返回按钮 */}
      <Button variant="ghost" onClick={() => router.push('/admin/responses')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        返回响应列表
      </Button>

      {/* 响应详情卡片 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(response.status)}
              <div>
                <CardTitle>响应详情</CardTitle>
                <CardDescription>响应 ID: {response.id}</CardDescription>
              </div>
            </div>
            {getStatusBadge(response.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 响应者信息 */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">响应者信息</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <span>{response.user?.full_name || response.user?.username}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{response.user?.phone || '无'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(response.created_at)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* 响应描述 */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">响应描述</h3>
            <p className="whitespace-pre-wrap">{response.description}</p>
          </div>

          {/* 响应图片 */}
          {response.images && response.images.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ImageIcon className="h-4 w-4" />
                <span>图片 ({response.images.length})</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {response.images.map((image, index) => (
                  <a
                    key={index}
                    href={image.startsWith('http') ? image : `http://localhost:8000${image}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block aspect-square rounded-lg overflow-hidden border hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={image.startsWith('http') ? image : `http://localhost:8000${image}`}
                      alt={`图片 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* 响应视频 */}
          {response.videos && response.videos.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Video className="h-4 w-4" />
                <span>视频 ({response.videos.length})</span>
              </div>
              <div className="space-y-4">
                {response.videos.map((video, index) => (
                  <div key={index} className="rounded-lg overflow-hidden border aspect-video max-w-2xl">
                    <ReactNextPlayer
                      src={video.startsWith('http') ? video : `http://localhost:8000${video}`}
                      controls
                      width="100%"
                      height="100%"
                      color="#3b82f6"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 关联的需求卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            响应的需求
          </CardTitle>
          <CardDescription>
            此响应关联的服务需求信息
          </CardDescription>
        </CardHeader>
        <CardContent>
          {response.need ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>{response.need.service_type}</Badge>
                    <Badge variant={response.need.status === 0 ? 'default' : 'secondary'}>
                      {response.need.status === 0 ? '已发布' : '已取消'}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold">{response.need.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {response.need.description}
                  </p>
                </div>
                <Link href={`/admin/needs/${response.need.id}`}>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    查看需求
                  </Button>
                </Link>
              </div>

              <Separator />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">发布者：</span>
                  <span className="font-medium">{response.need.user?.full_name || response.need.user?.username}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">联系电话：</span>
                  <span className="font-medium">{response.need.user?.phone || '无'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">地域：</span>
                  <span className="font-medium">{response.need.region?.full_name || '未知'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">发布时间：</span>
                  <span className="font-medium">{formatDate(response.need.created_at)}</span>
                </div>
              </div>

              {/* 需求图片预览 */}
              {response.need.images && response.need.images.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">需求图片：</p>
                  <div className="flex gap-2 flex-wrap">
                    {response.need.images.slice(0, 4).map((image, idx) => (
                      <img
                        key={idx}
                        src={image.startsWith('http') ? image : `http://localhost:8000${image}`}
                        alt={`需求图片 ${idx + 1}`}
                        className="w-16 h-16 object-cover rounded border"
                      />
                    ))}
                    {response.need.images.length > 4 && (
                      <div className="w-16 h-16 bg-muted rounded border flex items-center justify-center text-sm text-muted-foreground">
                        +{response.need.images.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">无关联需求信息</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
