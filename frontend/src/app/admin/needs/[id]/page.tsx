'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import type { Need, User } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  ArrowLeft,
  MapPin,
  User as UserIcon,
  Clock,
  Phone,
  Image as ImageIcon,
  Video,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { ReactNextPlayer } from 'reactnextplayer';

// 需求关联的响应类型
interface NeedResponse {
  id: number;
  user: User;
  description: string;
  images: string[];
  videos: string[];
  status: number;
  status_display: string;
  created_at: string;
  updated_at: string;
}

export default function AdminNeedDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [need, setNeed] = useState<Need | null>(null);
  const [responses, setResponses] = useState<NeedResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingResponses, setLoadingResponses] = useState(false);

  // 获取需求详情
  const fetchNeed = async () => {
    try {
      const response = await api.get(`/needs/admin/${params.id}/`);
      if (response.data.code === 200) {
        setNeed(response.data.data);
      } else {
        toast.error(response.data.message || '获取需求详情失败');
      }
    } catch (error: any) {
      console.error('获取需求详情失败:', error);
      toast.error(error.response?.data?.message || '获取需求详情失败');
    }
  };

  // 获取响应列表
  const fetchResponses = async () => {
    setLoadingResponses(true);
    try {
      const response = await api.get(`/needs/admin/${params.id}/responses/`);
      if (response.data.code === 200) {
        setResponses(response.data.data);
      }
    } catch (error: any) {
      console.error('获取响应列表失败:', error);
    } finally {
      setLoadingResponses(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchNeed();
      setLoading(false);
    };
    loadData();
  }, [params.id]);

  useEffect(() => {
    if (need) {
      fetchResponses();
    }
  }, [need]);

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
  const getResponseStatusBadge = (status: number) => {
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
  const getResponseStatusIcon = (status: number) => {
    switch (status) {
      case 0:
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 1:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 2:
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 3:
        return <XCircle className="h-4 w-4 text-gray-500" />;
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

  if (!need) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">需求不存在</h2>
        <Button className="mt-4" onClick={() => router.push('/admin/needs')}>
          返回需求列表
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 返回按钮 */}
      <Button variant="ghost" onClick={() => router.push('/admin/needs')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        返回需求列表
      </Button>

      {/* 需求详情卡片 */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge>{need.service_type}</Badge>
            <Badge variant={need.status === 0 ? 'default' : 'secondary'}>
              {need.status === 0 ? '已发布' : '已取消'}
            </Badge>
            {(need.accepted_count ?? 0) > 0 && (
              <Badge variant="default" className="bg-green-500">
                {need.accepted_count} 人已接单
              </Badge>
            )}
          </div>
          <CardTitle className="text-2xl">{need.title}</CardTitle>
          <CardDescription>需求 ID: {need.id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 描述 */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">需求描述</h3>
            <p className="whitespace-pre-wrap">{need.description}</p>
          </div>

          {/* 图片 */}
          {need.images && need.images.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ImageIcon className="h-4 w-4" />
                <span>图片 ({need.images.length})</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {need.images.map((image, index) => (
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

          {/* 视频 */}
          {need.videos && need.videos.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Video className="h-4 w-4" />
                <span>视频 ({need.videos.length})</span>
              </div>
              <div className="space-y-4">
                {need.videos.map((video, index) => (
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

          <Separator />

          {/* 元信息 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{need.region?.full_name || '未知地区'}</span>
            </div>
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              <span>{need.user?.full_name || need.user?.username}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{need.user?.phone || '无'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{formatDate(need.created_at)}</span>
            </div>
          </div>

          {/* 响应统计 */}
          <div className="flex items-center gap-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <span className="text-sm">总响应: <strong>{need.response_count || 0}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm">已接受: <strong>{need.accepted_count || 0}</strong></span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 响应列表卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            响应列表
          </CardTitle>
          <CardDescription>
            共 {responses.length} 条响应
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingResponses ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : responses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>暂无响应</p>
            </div>
          ) : (
            <div className="space-y-4">
              {responses.map((response) => (
                <div key={response.id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {response.user?.full_name?.slice(0, 2) || response.user?.username?.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{response.user?.full_name || response.user?.username}</span>
                        {getResponseStatusBadge(response.status)}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(response.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {response.user?.phone}
                      </p>
                      <p className="mt-3 whitespace-pre-wrap">{response.description}</p>

                      {/* 响应图片 */}
                      {response.images && response.images.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <ImageIcon className="h-4 w-4" />
                            <span>图片 ({response.images.length})</span>
                          </div>
                          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                            {response.images.map((image, idx) => (
                              <a
                                key={idx}
                                href={image.startsWith('http') ? image : `http://localhost:8000${image}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block aspect-square rounded overflow-hidden border hover:opacity-80 transition-opacity"
                              >
                                <img
                                  src={image.startsWith('http') ? image : `http://localhost:8000${image}`}
                                  alt={`响应图片 ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 响应视频 */}
                      {response.videos && response.videos.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Video className="h-4 w-4" />
                            <span>视频 ({response.videos.length})</span>
                          </div>
                          <div className="space-y-2">
                            {response.videos.map((video, idx) => (
                              <div key={idx} className="rounded overflow-hidden border aspect-video max-w-md">
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
                    </div>
                    <div className="flex-shrink-0">
                      {getResponseStatusIcon(response.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
