'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import api from '@/lib/api';
import type { Region, Need } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { Loader2, ArrowLeft } from 'lucide-react';
import { FileUpload } from '@/components/ui/file-upload';

const SERVICE_TYPES = [
  '管道维修',
  '助老服务',
  '保洁服务',
  '就诊服务',
  '营养餐服务',
  '定期接送服务',
  '其他',
];

export default function EditNeedPage() {
  const router = useRouter();
  const params = useParams();
  const needId = params.id;

  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    region: '',
    service_type: '',
    title: '',
    description: '',
    images: [] as string[],
    videos: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 获取需求详情
  useEffect(() => {
    const fetchNeed = async () => {
      try {
        const response = await api.get(`/needs/${needId}/`);
        const need: Need = response.data;
        
        // 检查是否可以编辑
        if (!need.can_edit) {
          toast.error('该需求已有响应，无法编辑');
          router.push('/my-needs');
          return;
        }
        
        setFormData({
          region: need.region?.id?.toString() || '',
          service_type: need.service_type,
          title: need.title,
          description: need.description,
          images: need.images || [],
          videos: need.videos || [],
        });
      } catch (error) {
        console.error('获取需求详情失败:', error);
        toast.error('获取需求详情失败');
        router.push('/my-needs');
      }
    };

    fetchNeed();
  }, [needId, router]);

  // 获取地域列表
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await api.get('/regions/');
        setRegions(response.data.results || response.data);
      } catch (error) {
        console.error('获取地域失败:', error);
        toast.error('获取地域列表失败');
      } finally {
        setLoading(false);
      }
    };
    fetchRegions();
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.region) newErrors.region = '请选择地域';
    if (!formData.service_type) newErrors.service_type = '请选择服务类型';
    if (!formData.title || formData.title.length < 5) {
      newErrors.title = '标题至少5个字符';
    }
    if (!formData.description || formData.description.length < 10) {
      newErrors.description = '描述至少10个字符';
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
      await api.put(`/needs/${needId}/`, {
        region: parseInt(formData.region),
        service_type: formData.service_type,
        title: formData.title,
        description: formData.description,
        images: formData.images,
        videos: formData.videos,
      });
      toast.success('需求修改成功！');
      router.push('/my-needs');
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
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">编辑服务需求</CardTitle>
            <CardDescription>
              修改您的服务需求信息
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="service_type">服务类型</Label>
                <Select
                  value={formData.service_type}
                  onValueChange={(value) => setFormData({ ...formData, service_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择服务类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.service_type && (
                  <p className="text-sm text-destructive">{errors.service_type}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">地域</Label>
                <Select
                  value={formData.region}
                  onValueChange={(value) => setFormData({ ...formData, region: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择地域" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region.id} value={region.id.toString()}>
                        {region.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.region && (
                  <p className="text-sm text-destructive">{errors.region}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">需求主题</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="简要描述您的需求"
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">需求描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  placeholder="详细描述您的需求，包括时间、地点、具体要求等"
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>上传图片（可选）</Label>
                <FileUpload
                  type="image"
                  maxFiles={5}
                  value={formData.images}
                  onChange={(urls) => setFormData({ ...formData, images: urls })}
                />
              </div>

              <div className="space-y-2">
                <Label>上传视频（可选）</Label>
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
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                    <p><strong>服务类型：</strong>{formData.service_type}</p>
                    <p><strong>需求主题：</strong>{formData.title}</p>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={confirmSubmit} disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                确认保存
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}

