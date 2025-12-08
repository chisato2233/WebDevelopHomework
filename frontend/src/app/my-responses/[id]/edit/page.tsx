'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import api from '@/lib/api';
import type { ServiceResponse } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { IconArrowLeft, IconLoader2, IconExternalLink } from '@tabler/icons-react';
import { FileUpload } from '@/components/ui/file-upload';

export default function EditResponsePage() {
  const router = useRouter();
  const params = useParams();
  const responseId = params.id;

  const [response, setResponse] = useState<ServiceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    images: [] as string[],
    videos: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 获取响应详情
  useEffect(() => {
    const fetchResponse = async () => {
      try {
        const res = await api.get(`/responses/${responseId}/`);
        const data: ServiceResponse = res.data;

        // 检查是否可以编辑（只有待接受状态可以编辑）
        if (data.status !== 0) {
          toast.error('该响应已被处理，无法编辑');
          router.push('/my-responses');
          return;
        }

        setResponse(data);
        setFormData({
          description: data.description || '',
          images: data.images || [],
          videos: data.videos || [],
        });
      } catch (error) {
        console.error('获取响应详情失败:', error);
        toast.error('获取响应详情失败');
        router.push('/my-responses');
      } finally {
        setLoading(false);
      }
    };

    fetchResponse();
  }, [responseId, router]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.description || formData.description.length < 10) {
      newErrors.description = '响应描述至少10个字符';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setShowConfirm(true);
    }
  };

  const confirmSubmit = async () => {
    setSubmitting(true);
    try {
      await api.put(`/responses/${responseId}/`, {
        description: formData.description,
        images: formData.images,
        videos: formData.videos,
      });
      toast.success('响应修改成功！');
      router.push('/my-responses');
    } catch (error: any) {
      toast.error(error.response?.data?.message || '修改失败');
    } finally {
      setSubmitting(false);
      setShowConfirm(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-10 w-20" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (!response) {
    return null;
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
          <IconArrowLeft className="mr-2 h-4 w-4" />
          返回
        </Button>

        {/* 关联需求信息 */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardDescription>响应的需求</CardDescription>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{response.need?.title}</CardTitle>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">{response.need?.service_type}</Badge>
                  <Badge variant="outline">{response.need?.region?.full_name}</Badge>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/needs/${response.need?.id}`}>
                  <IconExternalLink className="mr-1 h-4 w-4" />
                  查看需求
                </Link>
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* 编辑表单 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">编辑服务响应</CardTitle>
            <CardDescription>
              修改您的响应内容，让需求方更好地了解您的服务
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="description">响应描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  placeholder="详细描述您能提供的服务，包括您的经验、时间安排、服务方式等"
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  已输入 {formData.description.length} 个字符，至少需要 10 个字符
                </p>
              </div>

              <div className="space-y-2">
                <Label>上传图片（可选）</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  可上传相关资质证书、服务案例等图片
                </p>
                <FileUpload
                  type="image"
                  maxFiles={5}
                  value={formData.images}
                  onChange={(urls) => setFormData({ ...formData, images: urls })}
                />
              </div>

              <div className="space-y-2">
                <Label>上传视频（可选）</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  可上传服务介绍视频或相关案例视频
                </p>
                <FileUpload
                  type="video"
                  maxFiles={2}
                  value={formData.videos}
                  onChange={(urls) => setFormData({ ...formData, videos: urls })}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.back()}
                >
                  取消
                </Button>
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
                  保存修改
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认修改</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div>
                  <span>确定要保存这些修改吗？</span>
                  <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
                    <p><strong>响应需求：</strong>{response.need?.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {formData.description}
                    </p>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={confirmSubmit} disabled={submitting}>
                {submitting && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
                确认保存
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}
