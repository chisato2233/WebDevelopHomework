'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import type { Need, ServiceResponse } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { IconArrowLeft, IconMapPin, IconUser, IconClock, IconPhone, IconLoader2, IconCheck, IconX, IconPhoto, IconVideo } from '@tabler/icons-react';
import { ReactNextPlayer } from 'reactnextplayer';
import { FileUpload } from '@/components/ui/file-upload';

export default function NeedDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [need, setNeed] = useState<Need | null>(null);
  const [responses, setResponses] = useState<ServiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [responseText, setResponseText] = useState('');
  const [responseImages, setResponseImages] = useState<string[]>([]);
  const [responseVideos, setResponseVideos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [actionDialog, setActionDialog] = useState<{ type: 'accept' | 'reject'; id: number } | null>(null);

  const isOwner = need?.user?.id === user?.id;

  const fetchNeed = async () => {
    try {
      const response = await api.get(`/needs/${params.id}/`);
      setNeed(response.data);
    } catch (error) {
      console.error('获取需求详情失败:', error);
      toast.error('获取需求详情失败');
    }
  };

  const fetchResponses = async () => {
    if (!isOwner) return;
    try {
      const response = await api.get(`/responses/need/${params.id}/`);
      setResponses(response.data.results || response.data);
    } catch (error) {
      console.error('获取响应列表失败:', error);
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
    if (need && isOwner) {
      fetchResponses();
    }
  }, [need, isOwner]);

  const handleSubmitResponse = async () => {
    if (responseText.length < 10) {
      toast.error('响应描述至少10个字符');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/responses/', {
        need: parseInt(params.id as string),
        description: responseText,
        images: responseImages,
        videos: responseVideos,
      });
      toast.success('响应提交成功！');
      setResponseText('');
      setResponseImages([]);
      setResponseVideos([]);
      setShowResponseForm(false);
      router.push('/my-responses');
    } catch (error: any) {
      const data = error.response?.data;
      // 优先显示具体的字段错误
      if (data?.errors) {
        const errorMessages = Object.values(data.errors).flat();
        toast.error(errorMessages[0] as string || '提交失败');
      } else {
        toast.error(data?.message || '提交失败');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccept = async (responseId: number) => {
    try {
      await api.post(`/responses/${responseId}/accept/`);
      toast.success('已接受响应');
      fetchResponses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || '操作失败');
    }
    setActionDialog(null);
  };

  const handleReject = async (responseId: number) => {
    try {
      await api.post(`/responses/${responseId}/reject/`);
      toast.success('已拒绝响应');
      fetchResponses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || '操作失败');
    }
    setActionDialog(null);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto space-y-6">
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
      </MainLayout>
    );
  }

  if (!need) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">需求不存在</h2>
          <Button className="mt-4" onClick={() => router.push('/needs')}>
            返回需求列表
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <IconArrowLeft className="mr-2 h-4 w-4" />
          返回
        </Button>

        {/* Need Detail */}
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge>{need.service_type}</Badge>
              <Badge variant={need.status === 0 ? 'default' : 'secondary'}>
                {need.status === 0 ? '已发布' : '已取消'}
              </Badge>
              {(need.accepted_count ?? 0) > 0 && (
                <Badge variant="default">
                  {need.accepted_count} 人已接单
                </Badge>
              )}
            </div>
            <CardTitle className="text-2xl">{need.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground whitespace-pre-wrap">{need.description}</p>

            {/* Images */}
            {need.images && need.images.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <IconPhoto className="h-4 w-4" />
                  <span>图片 ({need.images.length})</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {need.images.map((image, index) => (
                    <a
                      key={index}
                      href={`http://localhost:8000${image}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block aspect-square rounded-lg overflow-hidden border hover:opacity-80 transition-opacity"
                    >
                      <img
                        src={`http://localhost:8000${image}`}
                        alt={`图片 ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Videos */}
            {need.videos && need.videos.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <IconVideo className="h-4 w-4" />
                  <span>视频 ({need.videos.length})</span>
                </div>
                <div className="space-y-4">
                  {need.videos.map((video, index) => (
                    <div key={index} className="rounded-lg overflow-hidden border aspect-video">
                      <ReactNextPlayer
                        src={`http://localhost:8000${video}`}
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
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <IconMapPin className="h-4 w-4 text-muted-foreground" />
                <span>{need.region?.full_name || '未知地区'}</span>
              </div>
              <div className="flex items-center gap-2">
                <IconUser className="h-4 w-4 text-muted-foreground" />
                <span>{need.user?.full_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <IconPhone className="h-4 w-4 text-muted-foreground" />
                <span>{need.user?.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <IconClock className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(need.created_at).toLocaleString()}</span>
              </div>
            </div>

            {/* Response Form (for non-owners) */}
            {!isOwner && need.status === 0 && (
              <>
                <Separator />
                {showResponseForm ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>响应描述</Label>
                      <Textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="描述您能提供的服务，包括经验、时间安排等..."
                        rows={4}
                      />
                      <p className="text-xs text-muted-foreground">
                        已输入 {responseText.length} 个字符，至少需要 10 个字符
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>上传图片（可选）</Label>
                      <FileUpload
                        type="image"
                        maxFiles={5}
                        value={responseImages}
                        onChange={setResponseImages}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>上传视频（可选）</Label>
                      <FileUpload
                        type="video"
                        maxFiles={2}
                        value={responseVideos}
                        onChange={setResponseVideos}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => {
                        setShowResponseForm(false);
                        setResponseText('');
                        setResponseImages([]);
                        setResponseVideos([]);
                      }}>
                        取消
                      </Button>
                      <Button onClick={handleSubmitResponse} disabled={submitting}>
                        {submitting && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
                        提交响应
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button size="lg" className="w-full" onClick={() => setShowResponseForm(true)}>
                    我要提供服务
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Responses (for owner) */}
        {isOwner && (
          <Card>
            <CardHeader>
              <CardTitle>收到的响应</CardTitle>
              <CardDescription>
                共 {responses.length} 条响应
              </CardDescription>
            </CardHeader>
            <CardContent>
              {responses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  暂无响应
                </div>
              ) : (
                <div className="space-y-4">
                  {responses.map((response) => (
                    <div key={response.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {response.user?.full_name?.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{response.user?.full_name}</span>
                              <Badge variant={
                                response.status === 0 ? 'outline' :
                                response.status === 1 ? 'default' :
                                response.status === 2 ? 'destructive' : 'secondary'
                              }>
                                {response.status === 0 ? '待接受' :
                                 response.status === 1 ? '已同意' :
                                 response.status === 2 ? '已拒绝' : '已取消'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {response.user?.phone}
                            </p>
                            <p className="mt-2">{response.description}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(response.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        {response.status === 0 && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => setActionDialog({ type: 'accept', id: response.id })}
                            >
                              <IconCheck className="mr-1 h-4 w-4" />
                              接受
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setActionDialog({ type: 'reject', id: response.id })}
                            >
                              <IconX className="mr-1 h-4 w-4" />
                              拒绝
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Dialog */}
        <AlertDialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {actionDialog?.type === 'accept' ? '确认接受' : '确认拒绝'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {actionDialog?.type === 'accept'
                  ? '接受后，响应者将能看到您的联系方式。确定接受这条响应吗？'
                  : '确定拒绝这条响应吗？此操作无法撤销。'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (actionDialog?.type === 'accept') {
                    handleAccept(actionDialog.id);
                  } else if (actionDialog) {
                    handleReject(actionDialog.id);
                  }
                }}
                className={actionDialog?.type === 'reject' ? 'bg-destructive hover:bg-destructive/90' : ''}
              >
                确认
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}

