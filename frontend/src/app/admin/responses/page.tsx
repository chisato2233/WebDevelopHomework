'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import type { ServiceResponse } from '@/types';
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
  HandHelping,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Eye,
  User as UserIcon,
  FileText,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '__all__', label: '全部状态' },
  { value: '0', label: '待接受' },
  { value: '1', label: '已同意' },
  { value: '2', label: '已拒绝' },
  { value: '3', label: '已取消' },
];

interface PaginatedResponses {
  results: ServiceResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export default function AdminResponsesPage() {
  const router = useRouter();
  const [responses, setResponses] = useState<ServiceResponse[]>([]);
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
    status: '__all__',
  });

  // 排序状态
  const [sortField, setSortField] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // 编辑弹窗
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingResponse, setEditingResponse] = useState<ServiceResponse | null>(null);
  const [editForm, setEditForm] = useState({
    description: '',
    status: 0,
  });
  const [saving, setSaving] = useState(false);

  // 删除确认
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingResponse, setDeletingResponse] = useState<ServiceResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  // 获取排序参数
  const getOrdering = useCallback(() => {
    return sortDirection === 'asc' ? sortField : `-${sortField}`;
  }, [sortField, sortDirection]);

  // 获取响应列表
  const fetchResponses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('page_size', pagination.pageSize.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.status !== '__all__') params.append('status', filters.status);
      params.append('ordering', getOrdering());

      const response = await api.get(`/responses/admin/?${params.toString()}`);
      if (response.data.code === 200) {
        const data: PaginatedResponses = response.data.data;
        setResponses(data.results);
        setPagination((prev) => ({
          ...prev,
          total: data.total,
          totalPages: data.total_pages,
        }));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '获取响应列表失败');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, filters, getOrdering]);

  useEffect(() => {
    fetchResponses();
  }, [fetchResponses]);

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
  const handleViewDetail = (response: ServiceResponse) => {
    router.push(`/admin/responses/${response.id}`);
  };

  // 打开编辑弹窗
  const handleEdit = (response: ServiceResponse) => {
    setEditingResponse(response);
    setEditForm({
      description: response.description,
      status: response.status,
    });
    setEditDialogOpen(true);
  };

  // 保存响应信息
  const handleSave = async () => {
    if (!editingResponse) return;

    setSaving(true);
    try {
      const response = await api.put(`/responses/admin/${editingResponse.id}/`, {
        description: editForm.description,
        status: editForm.status,
      });
      if (response.data.code === 200) {
        toast.success('更新成功');
        setEditDialogOpen(false);
        fetchResponses();
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
  const handleDeleteConfirm = (response: ServiceResponse) => {
    setDeletingResponse(response);
    setDeleteDialogOpen(true);
  };

  // 删除响应
  const handleDelete = async () => {
    if (!deletingResponse) return;

    setDeleting(true);
    try {
      const response = await api.delete(`/responses/admin/${deletingResponse.id}/`);
      if (response.data.code === 200) {
        toast.success('删除成功');
        setDeleteDialogOpen(false);
        fetchResponses();
      } else {
        toast.error(response.data.message || '删除失败');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '删除失败');
    } finally {
      setDeleting(false);
    }
  };

  // 处理排序点击
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // 获取排序图标
  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 h-4 w-4 text-muted-foreground/50" />;
    }
    return sortDirection === 'asc'
      ? <ArrowUp className="ml-1 h-4 w-4" />
      : <ArrowDown className="ml-1 h-4 w-4" />;
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

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold">响应管理</h1>
        <p className="text-muted-foreground mt-1">查看和管理所有服务响应</p>
      </div>

      {/* 筛选栏 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* 搜索框 */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索描述、用户名、需求标题..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>

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

            {/* 加载指示器 */}
            {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
        </CardContent>
      </Card>

      {/* 响应列表表格 */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead
                  className="w-[60px] cursor-pointer hover:bg-muted/80 transition-colors select-none"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center">
                    ID
                    {getSortIcon('id')}
                  </div>
                </TableHead>
                <TableHead>响应者</TableHead>
                <TableHead>响应需求</TableHead>
                <TableHead className="max-w-[200px]">描述</TableHead>
                <TableHead
                  className="text-center cursor-pointer hover:bg-muted/80 transition-colors select-none"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center justify-center">
                    状态
                    {getSortIcon('status')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/80 transition-colors select-none"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center">
                    创建时间
                    {getSortIcon('created_at')}
                  </div>
                </TableHead>
                <TableHead className="text-center w-[120px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && responses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : responses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <HandHelping className="h-8 w-8" />
                      <p>暂无响应数据</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                responses.map((response) => (
                  <TableRow key={response.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewDetail(response)}>
                    <TableCell className="font-mono text-muted-foreground">{response.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        <span>{response.user?.full_name || response.user?.username}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div className="max-w-[150px]">
                          <p className="font-medium truncate">{response.need?.title}</p>
                          <p className="text-xs text-muted-foreground">
                            by {response.need?.user?.full_name || response.need?.user?.username}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm truncate max-w-[200px]">{response.description}</p>
                    </TableCell>
                    <TableCell className="text-center">{getStatusBadge(response.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(response.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" onClick={() => handleViewDetail(response)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(response)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteConfirm(response)}
                          disabled={response.status === 3}
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
            <DialogTitle>编辑响应</DialogTitle>
            <DialogDescription>编辑响应 #{editingResponse?.id} 的信息</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
                  <SelectItem value="0">待接受</SelectItem>
                  <SelectItem value="1">已同意</SelectItem>
                  <SelectItem value="2">已拒绝</SelectItem>
                  <SelectItem value="3">已取消</SelectItem>
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
              确定要删除该响应吗？此操作将把响应标记为已取消。
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
