'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import type { Need, Region } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  FileText,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Eye,
  MapPin,
  User as UserIcon,
  MessageSquare,
  CheckCircle,
} from 'lucide-react';

const SERVICE_TYPES = [
  { value: '__all__', label: '全部类型' },
  { value: '管道维修', label: '管道维修' },
  { value: '助老服务', label: '助老服务' },
  { value: '保洁服务', label: '保洁服务' },
  { value: '就诊服务', label: '就诊服务' },
  { value: '营养餐服务', label: '营养餐服务' },
  { value: '定期接送服务', label: '定期接送服务' },
  { value: '其他', label: '其他' },
];

const STATUS_OPTIONS = [
  { value: '__all__', label: '全部状态' },
  { value: '0', label: '已发布' },
  { value: '-1', label: '已取消' },
];

interface PaginatedNeeds {
  results: Need[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export default function AdminNeedsPage() {
  const router = useRouter();
  const [needs, setNeeds] = useState<Need[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });

  // 筛选条件
  const [filters, setFilters] = useState({
    search: '',
    service_type: '__all__',
    region_id: '__all__',
    status: '__all__',
    ordering: '-created_at',
  });

  // 编辑弹窗
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingNeed, setEditingNeed] = useState<Need | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    service_type: '',
    region: '',
    status: 0,
  });
  const [saving, setSaving] = useState(false);

  // 删除确认
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingNeed, setDeletingNeed] = useState<Need | null>(null);
  const [deleting, setDeleting] = useState(false);

  // 获取地域列表
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await api.get('/regions/');
        setRegions(response.data.results || response.data);
      } catch (error) {
        console.error('获取地域失败:', error);
      }
    };
    fetchRegions();
  }, []);

  // 获取需求列表
  const fetchNeeds = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('page_size', pagination.pageSize.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.service_type !== '__all__') params.append('service_type', filters.service_type);
      if (filters.region_id !== '__all__') params.append('region_id', filters.region_id);
      if (filters.status !== '__all__') params.append('status', filters.status);
      if (filters.ordering) params.append('ordering', filters.ordering);

      const response = await api.get(`/needs/admin/?${params.toString()}`);
      if (response.data.code === 200) {
        const data: PaginatedNeeds = response.data.data;
        setNeeds(data.results);
        setPagination((prev) => ({
          ...prev,
          total: data.total,
          totalPages: data.total_pages,
        }));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '获取需求列表失败');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, filters]);

  useEffect(() => {
    fetchNeeds();
  }, [fetchNeeds]);

  // 搜索防抖
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput }));
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // 查看详情 - 跳转到详情页面
  const handleViewDetail = (need: Need) => {
    router.push(`/admin/needs/${need.id}`);
  };

  // 打开编辑弹窗
  const handleEdit = (need: Need) => {
    setEditingNeed(need);
    setEditForm({
      title: need.title,
      description: need.description,
      service_type: need.service_type,
      region: need.region?.id?.toString() || '',
      status: need.status,
    });
    setEditDialogOpen(true);
  };

  // 保存需求信息
  const handleSave = async () => {
    if (!editingNeed) return;

    setSaving(true);
    try {
      const response = await api.put(`/needs/admin/${editingNeed.id}/`, {
        title: editForm.title,
        description: editForm.description,
        service_type: editForm.service_type,
        region: editForm.region ? parseInt(editForm.region) : null,
        status: editForm.status,
      });
      if (response.data.code === 200) {
        toast.success('更新成功');
        setEditDialogOpen(false);
        fetchNeeds();
      } else {
        toast.error(response.data.message || '更新失败');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '更新失败');
    } finally {
      setSaving(false);
    }
  };

  // 打开删除确认
  const handleDeleteConfirm = (need: Need) => {
    setDeletingNeed(need);
    setDeleteDialogOpen(true);
  };

  // 删除需求
  const handleDelete = async () => {
    if (!deletingNeed) return;

    setDeleting(true);
    try {
      const response = await api.delete(`/needs/admin/${deletingNeed.id}/`);
      if (response.data.code === 200) {
        toast.success('删除成功');
        setDeleteDialogOpen(false);
        fetchNeeds();
      } else {
        toast.error(response.data.message || '删除失败');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '删除失败');
    } finally {
      setDeleting(false);
    }
  };

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

  // 获取状态徽章
  const getStatusBadge = (status: number) => {
    if (status === 0) {
      return <Badge variant="outline" className="border-green-500 text-green-500">已发布</Badge>;
    }
    return <Badge variant="outline" className="border-red-500 text-red-500">已取消</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold">需求管理</h1>
        <p className="text-muted-foreground mt-1">查看和管理所有服务需求</p>
      </div>

      {/* 筛选栏 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* 搜索框 */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索标题、描述、用户名..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* 服务类型筛选 */}
            <Select
              value={filters.service_type}
              onValueChange={(value) => {
                setFilters((prev) => ({ ...prev, service_type: value }));
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="服务类型" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 地域筛选 */}
            <Select
              value={filters.region_id}
              onValueChange={(value) => {
                setFilters((prev) => ({ ...prev, region_id: value }));
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="地域" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">全部地域</SelectItem>
                {regions.map((region) => (
                  <SelectItem key={region.id} value={region.id.toString()}>
                    {region.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 状态筛选 */}
            <Select
              value={filters.status}
              onValueChange={(value) => {
                setFilters((prev) => ({ ...prev, status: value }));
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 排序 */}
            <Select
              value={filters.ordering}
              onValueChange={(value) => {
                setFilters((prev) => ({ ...prev, ordering: value }));
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="排序" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-created_at">创建时间 (新)</SelectItem>
                <SelectItem value="created_at">创建时间 (旧)</SelectItem>
                <SelectItem value="-updated_at">更新时间 (新)</SelectItem>
                <SelectItem value="title">标题</SelectItem>
              </SelectContent>
            </Select>

            {/* 加载指示器 */}
            {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
        </CardContent>
      </Card>

      {/* 需求列表表格 */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[60px]">ID</TableHead>
                <TableHead>标题</TableHead>
                <TableHead>发布者</TableHead>
                <TableHead>服务类型</TableHead>
                <TableHead>地域</TableHead>
                <TableHead className="text-center">响应数</TableHead>
                <TableHead className="text-center">状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="text-center w-[120px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && needs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : needs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileText className="h-8 w-8" />
                      <p>暂无需求数据</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                needs.map((need) => (
                  <TableRow key={need.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewDetail(need)}>
                    <TableCell className="font-mono text-muted-foreground">{need.id}</TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        <p className="font-medium truncate">{need.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{need.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        <span>{need.user?.full_name || need.user?.username}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{need.service_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {need.region?.full_name || '-'}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <span className="flex items-center gap-1 text-blue-500">
                          <MessageSquare className="h-3.5 w-3.5" />
                          {need.response_count || 0}
                        </span>
                        <span className="flex items-center gap-1 text-green-500">
                          <CheckCircle className="h-3.5 w-3.5" />
                          {need.accepted_count || 0}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{getStatusBadge(need.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(need.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" onClick={() => handleViewDetail(need)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(need)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteConfirm(need)}
                          disabled={need.status === -1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* 分页 */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <p className="text-sm text-muted-foreground">
              共 {pagination.total} 条记录，第 {pagination.page} / {pagination.totalPages} 页
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                上一页
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.totalPages}
              >
                下一页
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 编辑弹窗 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>编辑需求</DialogTitle>
            <DialogDescription>编辑需求 #{editingNeed?.id} 的信息</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                标题
              </Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                描述
              </Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                className="col-span-3"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="service_type" className="text-right">
                服务类型
              </Label>
              <Select
                value={editForm.service_type}
                onValueChange={(value) => setEditForm((prev) => ({ ...prev, service_type: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.filter((t) => t.value !== '__all__').map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="region" className="text-right">
                地域
              </Label>
              <Select
                value={editForm.region}
                onValueChange={(value) => setEditForm((prev) => ({ ...prev, region: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="选择地域" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.id} value={region.id.toString()}>
                      {region.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                状态
              </Label>
              <Select
                value={editForm.status.toString()}
                onValueChange={(value) =>
                  setEditForm((prev) => ({ ...prev, status: parseInt(value) }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">已发布</SelectItem>
                  <SelectItem value="-1">已取消</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认弹窗 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除需求 &quot;{deletingNeed?.title}&quot; 吗？此操作将把需求标记为已取消。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
