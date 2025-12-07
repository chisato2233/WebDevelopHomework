'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import api from '@/lib/api';
import type { Need, PaginatedResponse } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, MapPin, User, Clock, MessageSquare } from 'lucide-react';

const SERVICE_TYPES = [
  '全部',
  '管道维修',
  '助老服务',
  '保洁服务',
  '就诊服务',
  '营养餐服务',
  '定期接送服务',
  '其他',
];

export default function NeedsPage() {
  const searchParams = useSearchParams();
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [serviceType, setServiceType] = useState(
    searchParams.get('service_type') || '全部'
  );
  const [searchKeyword, setSearchKeyword] = useState('');

  const fetchNeeds = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: currentPage.toString(),
      };
      if (serviceType && serviceType !== '全部') {
        params.service_type = serviceType;
      }
      if (searchKeyword) {
        params.search = searchKeyword;
      }

      const response = await api.get<PaginatedResponse<Need>>('/needs/', { params });
      setNeeds(response.data.results);
      setTotalCount(response.data.count);
    } catch (error) {
      console.error('获取需求列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNeeds();
  }, [currentPage, serviceType]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchNeeds();
  };

  const totalPages = Math.ceil(totalCount / 10);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">浏览服务需求</h1>
          <p className="text-muted-foreground mt-1">
            发现社区中的服务需求，提供您的帮助
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-48">
                <Select value={serviceType} onValueChange={(value) => {
                  setServiceType(value);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择服务类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="搜索需求标题或描述..."
                    className="pl-9"
                  />
                </div>
                <Button type="submit">搜索</Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            共找到 <span className="font-medium text-foreground">{totalCount}</span> 条需求
          </p>
        </div>

        {/* Needs List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : needs.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-lg font-medium">暂无需求</h3>
                <p className="text-muted-foreground mt-1">
                  当前筛选条件下没有找到任何需求
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {needs.map((need) => (
              <Card key={need.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge>{need.service_type}</Badge>
                        {(need.accepted_count ?? 0) > 0 && (
                          <Badge variant="default">
                            {need.accepted_count} 人已接单
                          </Badge>
                        )}
                        {(need.response_count ?? 0) > 0 && (
                          <Badge variant="outline">
                            <MessageSquare className="mr-1 h-3 w-3" />
                            {need.response_count} 待处理
                          </Badge>
                        )}
                      </div>
                      
                      <Link
                        href={`/needs/${need.id}`}
                        className="block text-xl font-semibold hover:text-primary transition-colors"
                      >
                        {need.title}
                      </Link>
                      
                      <p className="text-muted-foreground line-clamp-2">
                        {need.description}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {need.region?.full_name || '未知地区'}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {need.user?.full_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(need.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <Button asChild>
                      <Link href={`/needs/${need.id}`}>查看详情</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              上一页
            </Button>
            <span className="px-4 py-2 text-sm text-muted-foreground">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              下一页
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
