'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
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
import { toast } from 'sonner';
import {
  MapPin,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Plus,
  FileText,
} from 'lucide-react';

interface AdminRegion {
  id: number;
  name: string;
  city: string;
  province: string;
  full_name: string;
  needs_count: number;
}

interface PaginatedRegions {
  results: AdminRegion[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export default function AdminRegionsPage() {
  const [regions, setRegions] = useState<AdminRegion[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });

  // 筛选条件
  const [filters, setFilters] = useState({
    search: '',
    province: '__all__',
    city: '__all__',
  });

  // 创建/编辑弹窗
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<AdminRegion | null>(null);
  const [form, setForm] = useState({
    name: '',
    city: '',
    province: '',
  });
  const [saving, setSaving] = useState(false);

  // 删除确认
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingRegion, setDeletingRegion] = useState<AdminRegion | null>(null);
  const [deleting, setDeleting] = useState(false);

  // 获取省份列表
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await api.get('/regions/admin/provinces/');
        if (response.data.code === 200) {
          setProvinces(response.data.data);
        }
      } catch (error) {
        console.error('获取省份失败:', error);
      }
    };
    fetchProvinces();
  }, []);

  // 根据省份获取城市列表
  useEffect(() => {
    const fetchCities = async () => {
      if (filters.province === '__all__') {
        setCities([]);
        return;
      }
      try {
        const response = await api.get(`/regions/admin/cities/?province=${filters.province}`);
        if (response.data.code === 200) {
          setCities(response.data.data);
        }
      } catch (error) {
        console.error('获取城市失败:', error);
      }
    };
    fetchCities();
  }, [filters.province]);

  // 获取地域列表
  const fetchRegions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('page_size', pagination.pageSize.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.province !== '__all__') params.append('province', filters.province);
      if (filters.city !== '__all__') params.append('city', filters.city);

      const response = await api.get(`/regions/admin/?${params.toString()}`);
      if (response.data.code === 200) {
        const data: PaginatedRegions = response.data.data;
        setRegions(data.results);
        setPagination((prev) => ({
          ...prev,
          total: data.total,
          totalPages: data.total_pages,
        }));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '获取地域列表失败');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, filters]);

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  // 搜索防抖
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput }));
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // 打开创建弹窗
  const handleCreate = () => {
    setEditingRegion(null);
    setForm({ name: '', city: '', province: '' });
    setDialogOpen(true);
  };

  // 打开编辑弹窗
  const handleEdit = (region: AdminRegion) => {
    setEditingRegion(region);
    setForm({
      name: region.name,
      city: region.city,
      province: region.province,
    });
    setDialogOpen(true);
  };

  // 保存地域
  const handleSave = async () => {
    if (!form.name || !form.city || !form.province) {
      toast.error('请填写完整信息');
      return;
    }

    setSaving(true);
    try {
      if (editingRegion) {
        // 编辑
        const response = await api.put(`/regions/admin/${editingRegion.id}/`, form);
        if (response.data.code === 200) {
          toast.success('更新成功');
          setDialogOpen(false);
          fetchRegions();
        } else {
          toast.error(response.data.message || '更新失败');
        }
      } else {
        // 创建
        const response = await api.post('/regions/admin/', form);
        if (response.data.code === 200) {
          toast.success('创建成功');
          setDialogOpen(false);
          fetchRegions();
        } else {
          toast.error(response.data.message || '创建失败');
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '操作失败');
    } finally {
      setSaving(false);
    }
  };

  // 打开删除确认
  const handleDeleteConfirm = (region: AdminRegion) => {
    setDeletingRegion(region);
    setDeleteDialogOpen(true);
  };

  // 删除地域
  const handleDelete = async () => {
    if (!deletingRegion) return;

    setDeleting(true);
    try {
      const response = await api.delete(`/regions/admin/${deletingRegion.id}/`);
      if (response.data.code === 200) {
        toast.success('删除成功');
        setDeleteDialogOpen(false);
        fetchRegions();
      } else {
        toast.error(response.data.message || '删除失败');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '删除失败');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">地域管理</h1>
          <p className="text-muted-foreground mt-1">管理系统中的地域信息</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          添加地域
        </Button>
      </div>

      {/* 筛选栏 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* 搜索框 */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索地域名称..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* 省份筛选 */}
            <Select
              value={filters.province}
              onValueChange={(value) => {
                setFilters((prev) => ({ ...prev, province: value, city: '__all__' }));
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="省份" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">全部省份</SelectItem>
                {provinces.map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 城市筛选 */}
            <Select
              value={filters.city}
              onValueChange={(value) => {
                setFilters((prev) => ({ ...prev, city: value }));
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              disabled={filters.province === '__all__'}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="城市" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">全部城市</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 加载指示器 */}
            {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
        </CardContent>
      </Card>

      {/* 地域列表表格 */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[60px]">ID</TableHead>
                <TableHead>地域名称</TableHead>
                <TableHead>所属城市</TableHead>
                <TableHead>所属省份</TableHead>
                <TableHead>完整名称</TableHead>
                <TableHead className="text-center">关联需求数</TableHead>
                <TableHead className="text-center w-[100px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && regions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : regions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <MapPin className="h-8 w-8" />
                      <p>暂无地域数据</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                regions.map((region) => (
                  <TableRow key={region.id}>
                    <TableCell className="font-mono text-muted-foreground">{region.id}</TableCell>
                    <TableCell className="font-medium">{region.name}</TableCell>
                    <TableCell>{region.city}</TableCell>
                    <TableCell>{region.province}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{region.full_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={region.needs_count > 0 ? 'secondary' : 'outline'} className="gap-1">
                        <FileText className="h-3 w-3" />
                        {region.needs_count}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(region)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteConfirm(region)}
                          disabled={region.needs_count > 0}
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

      {/* 创建/编辑弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>{editingRegion ? '编辑地域' : '添加地域'}</DialogTitle>
            <DialogDescription>
              {editingRegion ? `编辑地域 #${editingRegion.id} 的信息` : '添加新的地域信息'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="province" className="text-right">
                省份
              </Label>
              <Input
                id="province"
                value={form.province}
                onChange={(e) => setForm((prev) => ({ ...prev, province: e.target.value }))}
                className="col-span-3"
                placeholder="例如：广东省"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="city" className="text-right">
                城市
              </Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                className="col-span-3"
                placeholder="例如：广州市"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                区/县
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
                placeholder="例如：天河区"
              />
            </div>
            {form.province && form.city && form.name && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-muted-foreground">预览</Label>
                <div className="col-span-3 flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{form.province}-{form.city}-{form.name}</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingRegion ? '保存' : '创建'}
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
              确定要删除地域 &quot;{deletingRegion?.full_name}&quot; 吗？此操作不可撤销。
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
