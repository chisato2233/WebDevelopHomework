'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import type { AdminUser } from '@/types';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Users,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Edit,
  FileText,
  HandHelping,
  Shield,
  User as UserIcon,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

interface PaginatedUsers {
  results: AdminUser[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
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
    user_type: '__all__',
    is_active: '__all__',
  });

  // 排序状态
  const [sortField, setSortField] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // 编辑弹窗
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    bio: '',
    user_type: 'normal' as 'normal' | 'admin',
    is_active: true,
  });
  const [saving, setSaving] = useState(false);

  // 获取排序参数
  const getOrdering = useCallback(() => {
    return sortDirection === 'asc' ? sortField : `-${sortField}`;
  }, [sortField, sortDirection]);

  // 获取用户列表
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('page_size', pagination.pageSize.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.user_type !== '__all__') params.append('user_type', filters.user_type);
      if (filters.is_active !== '__all__') params.append('is_active', filters.is_active);
      params.append('ordering', getOrdering());

      const response = await api.get(`/auth/admin/users/?${params.toString()}`);
      if (response.data.code === 200) {
        const data: PaginatedUsers = response.data.data;
        setUsers(data.results);
        setPagination((prev) => ({
          ...prev,
          total: data.total,
          totalPages: data.total_pages,
        }));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '获取用户列表失败');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, filters, getOrdering]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 搜索防抖
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput }));
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // 打开编辑弹窗
  const handleEdit = (user: AdminUser) => {
    setEditingUser(user);
    setEditForm({
      full_name: user.full_name || '',
      phone: user.phone || '',
      bio: user.bio || '',
      user_type: user.user_type,
      is_active: user.is_active,
    });
    setEditDialogOpen(true);
  };

  // 保存用户信息
  const handleSave = async () => {
    if (!editingUser) return;

    setSaving(true);
    try {
      const response = await api.put(`/auth/admin/users/${editingUser.id}/`, editForm);
      if (response.data.code === 200) {
        toast.success('更新成功');
        setEditDialogOpen(false);
        fetchUsers();
      } else {
        toast.error(response.data.message || '更新失败');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '更新失败');
    } finally {
      setSaving(false);
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
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold">用户管理</h1>
        <p className="text-muted-foreground mt-1">查看和管理所有注册用户</p>
      </div>

      {/* 筛选栏 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* 搜索框 */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索用户名、姓名、手机号..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* 用户类型筛选 */}
            <Select
              value={filters.user_type}
              onValueChange={(value) => {
                setFilters((prev) => ({ ...prev, user_type: value }));
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="用户类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">全部类型</SelectItem>
                <SelectItem value="normal">普通用户</SelectItem>
                <SelectItem value="admin">管理员</SelectItem>
              </SelectContent>
            </Select>

            {/* 状态筛选 */}
            <Select
              value={filters.is_active}
              onValueChange={(value) => {
                setFilters((prev) => ({ ...prev, is_active: value }));
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">全部状态</SelectItem>
                <SelectItem value="true">启用</SelectItem>
                <SelectItem value="false">禁用</SelectItem>
              </SelectContent>
            </Select>

            {/* 加载指示器 */}
            {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
        </CardContent>
      </Card>

      {/* 用户列表表格 */}
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
                <TableHead
                  className="cursor-pointer hover:bg-muted/80 transition-colors select-none"
                  onClick={() => handleSort('username')}
                >
                  <div className="flex items-center">
                    用户名
                    {getSortIcon('username')}
                  </div>
                </TableHead>
                <TableHead>姓名</TableHead>
                <TableHead>手机号</TableHead>
                <TableHead className="text-center">类型</TableHead>
                <TableHead className="text-center">状态</TableHead>
                <TableHead className="text-center">需求/响应</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/80 transition-colors select-none"
                  onClick={() => handleSort('date_joined')}
                >
                  <div className="flex items-center">
                    注册时间
                    {getSortIcon('date_joined')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/80 transition-colors select-none"
                  onClick={() => handleSort('last_login')}
                >
                  <div className="flex items-center">
                    最近登录
                    {getSortIcon('last_login')}
                  </div>
                </TableHead>
                <TableHead className="text-center w-[80px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-32 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Users className="h-8 w-8" />
                      <p>暂无用户数据</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-muted-foreground">{user.id}</TableCell>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.full_name || '-'}</TableCell>
                    <TableCell className="font-mono">{user.phone || '-'}</TableCell>
                    <TableCell className="text-center">
                      {user.user_type === 'admin' ? (
                        <Badge variant="default" className="gap-1">
                          <Shield className="h-3 w-3" />
                          管理员
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <UserIcon className="h-3 w-3" />
                          普通用户
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {user.is_active ? (
                        <Badge variant="outline" className="border-green-500 text-green-500">
                          启用
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-red-500 text-red-500">
                          禁用
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-3 text-sm">
                        <span className="flex items-center gap-1 text-blue-500">
                          <FileText className="h-3.5 w-3.5" />
                          {user.needs_count}
                        </span>
                        <span className="flex items-center gap-1 text-green-500">
                          <HandHelping className="h-3.5 w-3.5" />
                          {user.responses_count}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(user.date_joined)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(user.last_login)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
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
            <DialogTitle>编辑用户</DialogTitle>
            <DialogDescription>
              编辑用户 {editingUser?.username} 的信息
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="full_name" className="text-right">
                姓名
              </Label>
              <Input
                id="full_name"
                value={editForm.full_name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, full_name: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                手机号
              </Label>
              <Input
                id="phone"
                value={editForm.phone}
                onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="bio" className="text-right pt-2">
                简介
              </Label>
              <Textarea
                id="bio"
                value={editForm.bio}
                onChange={(e) => setEditForm((prev) => ({ ...prev, bio: e.target.value }))}
                className="col-span-3"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="user_type" className="text-right">
                用户类型
              </Label>
              <Select
                value={editForm.user_type}
                onValueChange={(value: 'normal' | 'admin') =>
                  setEditForm((prev) => ({ ...prev, user_type: value }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">普通用户</SelectItem>
                  <SelectItem value="admin">管理员</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is_active" className="text-right">
                启用状态
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={editForm.is_active}
                  onCheckedChange={(checked) =>
                    setEditForm((prev) => ({ ...prev, is_active: checked }))
                  }
                />
                <span className="text-sm text-muted-foreground">
                  {editForm.is_active ? '已启用' : '已禁用'}
                </span>
              </div>
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
    </div>
  );
}
