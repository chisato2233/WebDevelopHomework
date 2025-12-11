'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { Region, ChartData } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, BarChart3, TrendingUp, FileText, Users, LineChartIcon, BarChart2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

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

// 生成月份选项（近24个月）
const generateMonthOptions = () => {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 24; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = `${date.getFullYear()}年${date.getMonth() + 1}月`;
    options.push({ value, label });
  }
  return options;
};

const MONTH_OPTIONS = generateMonthOptions();

type ChartType = 'line' | 'bar';
type SortField = 'month' | 'needs' | 'accepted' | null;
type SortDirection = 'asc' | 'desc';

export default function AdminStatisticsPage() {
  const { user } = useAuth();
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [summary, setSummary] = useState<{ total_needs: number; total_accepted: number } | null>(null);
  const [chartType, setChartType] = useState<ChartType>('line');
  const [activeTab, setActiveTab] = useState<'chart' | 'table'>('chart');
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // 筛选条件
  const [filters, setFilters] = useState({
    start_month: MONTH_OPTIONS[5]?.value || '',
    end_month: MONTH_OPTIONS[0]?.value || '',
    region_id: '__all__',
    service_type: '__all__',
  });

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

  // 获取统计数据
  const fetchStatistics = useCallback(async () => {
    if (!user || user.user_type !== 'admin') return;

    // 验证月份
    if (filters.start_month > filters.end_month) {
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.start_month) params.append('start_month', filters.start_month);
      if (filters.end_month) params.append('end_month', filters.end_month);
      if (filters.region_id && filters.region_id !== '__all__') params.append('region_id', filters.region_id);
      if (filters.service_type && filters.service_type !== '__all__') params.append('service_type', filters.service_type);

      const response = await api.get(`/statistics/monthly/?${params.toString()}`);
      if (response.data.code === 200) {
        setChartData(response.data.data.chart_data);
        setSummary(response.data.data.summary);
      } else {
        toast.error(response.data.message || '获取统计数据失败');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '获取统计数据失败');
    } finally {
      setLoading(false);
    }
  }, [filters, user]);

  // 筛选条件变化时自动刷新
  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  // 转换为图表格式
  const getRechartsData = () => {
    if (!chartData) return [];
    return chartData.labels.map((label, index) => ({
      month: label,
      需求发布数: chartData.needs[index],
      响应成功数: chartData.accepted[index],
    }));
  };

  // 获取排序后的表格数据
  const getSortedTableData = () => {
    if (!chartData) return [];

    const data = chartData.labels.map((label, index) => ({
      month: label,
      monthValue: label, // 用于月份排序
      needs: chartData.needs[index],
      accepted: chartData.accepted[index],
      rate: chartData.needs[index] > 0
        ? ((chartData.accepted[index] / chartData.needs[index]) * 100).toFixed(1)
        : '0.0',
    }));

    if (!sortField) return data;

    return [...data].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'month') {
        comparison = a.monthValue.localeCompare(b.monthValue);
      } else if (sortField === 'needs') {
        comparison = a.needs - b.needs;
      } else if (sortField === 'accepted') {
        comparison = a.accepted - b.accepted;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  // 处理排序点击
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // 同一字段，切换排序方向
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // 不同字段，设置新字段，默认降序
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // 获取排序图标
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 h-4 w-4 text-muted-foreground/50" />;
    }
    return sortDirection === 'asc'
      ? <ArrowUp className="ml-1 h-4 w-4" />
      : <ArrowDown className="ml-1 h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* 页面标题和汇总数据 */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">统计分析</h1>
          <p className="text-muted-foreground mt-1">
            平台服务需求与响应的月度统计
          </p>
        </div>

        {/* 汇总卡片 */}
        {summary && (
          <div className="flex gap-4">
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">累计需求</p>
                <p className="text-xl font-bold text-blue-500">{summary.total_needs}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">累计响应</p>
                <p className="text-xl font-bold text-green-500">{summary.total_accepted}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 主图表区域 */}
      <Card className="overflow-hidden">
        {/* 筛选条件栏 - 融入图表顶部 */}
        <div className="border-b bg-muted/30 px-6 py-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* 时间范围 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">时间：</span>
              <Select
                value={filters.start_month}
                onValueChange={(value) => setFilters({ ...filters, start_month: value })}
              >
                <SelectTrigger className="w-[130px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-muted-foreground">至</span>
              <Select
                value={filters.end_month}
                onValueChange={(value) => setFilters({ ...filters, end_month: value })}
              >
                <SelectTrigger className="w-[130px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="h-6 w-px bg-border" />

            {/* 地域筛选 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">地域：</span>
              <Select
                value={filters.region_id}
                onValueChange={(value) => setFilters({ ...filters, region_id: value })}
              >
                <SelectTrigger className="w-[160px] h-9">
                  <SelectValue />
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
            </div>

            <div className="h-6 w-px bg-border" />

            {/* 服务类型筛选 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">类型：</span>
              <Select
                value={filters.service_type}
                onValueChange={(value) => setFilters({ ...filters, service_type: value })}
              >
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 加载指示器 */}
            {loading && (
              <>
                <div className="h-6 w-px bg-border" />
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </>
            )}

            {/* 图表类型切换 - 靠右 */}
            <div className="flex items-center gap-1 ml-auto">
              <Button
                variant={chartType === 'line' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 px-3"
                onClick={() => setChartType('line')}
              >
                <LineChartIcon className="h-4 w-4 mr-1" />
                折线
              </Button>
              <Button
                variant={chartType === 'bar' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 px-3"
                onClick={() => setChartType('bar')}
              >
                <BarChart2 className="h-4 w-4 mr-1" />
                柱状
              </Button>
            </div>
          </div>
        </div>

        {/* 图表/表格切换 */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'chart' | 'table')}>
          <div className="px-6 pt-4 flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="chart" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                趋势图
              </TabsTrigger>
              <TabsTrigger value="table" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                明细表
              </TabsTrigger>
            </TabsList>

            {filters.start_month > filters.end_month && (
              <p className="text-sm text-destructive">起始月份不能大于终止月份</p>
            )}
          </div>

          <TabsContent value="chart" className="mt-0">
            <CardContent className="pt-4">
              {chartData && chartData.labels.length > 0 ? (
                <div className="h-[450px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'line' ? (
                      <LineChart data={getRechartsData()} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 12 }}
                          className="text-muted-foreground"
                          axisLine={{ className: 'stroke-border' }}
                        />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          className="text-muted-foreground"
                          axisLine={{ className: 'stroke-border' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="需求发布数"
                          stroke="#3b82f6"
                          strokeWidth={2.5}
                          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="响应成功数"
                          stroke="#22c55e"
                          strokeWidth={2.5}
                          dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                      </LineChart>
                    ) : (
                      <BarChart data={getRechartsData()} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 12 }}
                          className="text-muted-foreground"
                          axisLine={{ className: 'stroke-border' }}
                        />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          className="text-muted-foreground"
                          axisLine={{ className: 'stroke-border' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          }}
                        />
                        <Legend />
                        <Bar dataKey="需求发布数" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="响应成功数" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              ) : !loading ? (
                <div className="h-[450px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">暂无统计数据</p>
                    <p className="text-sm">请调整查询条件</p>
                  </div>
                </div>
              ) : (
                <div className="h-[450px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
            </CardContent>
          </TabsContent>

          <TabsContent value="table" className="mt-0">
            <CardContent className="pt-4">
              {chartData && chartData.labels.length > 0 ? (
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead
                          className="font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                          onClick={() => handleSort('month')}
                        >
                          <div className="flex items-center">
                            月份
                            {getSortIcon('month')}
                          </div>
                        </TableHead>
                        <TableHead
                          className="text-right font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                          onClick={() => handleSort('needs')}
                        >
                          <div className="flex items-center justify-end">
                            月累计发布需求数
                            {getSortIcon('needs')}
                          </div>
                        </TableHead>
                        <TableHead
                          className="text-right font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                          onClick={() => handleSort('accepted')}
                        >
                          <div className="flex items-center justify-end">
                            月累计响应成功数
                            {getSortIcon('accepted')}
                          </div>
                        </TableHead>
                        <TableHead className="text-right font-semibold">响应率</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getSortedTableData().map((row) => (
                        <TableRow key={row.month}>
                          <TableCell className="font-medium">{row.month}</TableCell>
                          <TableCell className="text-right">
                            <span className="text-blue-500 font-medium">{row.needs}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-green-500 font-medium">{row.accepted}</span>
                          </TableCell>
                          <TableCell className="text-right">{row.rate}%</TableCell>
                        </TableRow>
                      ))}
                      {/* 合计行 */}
                      <TableRow className="bg-muted/30 font-semibold">
                        <TableCell>合计</TableCell>
                        <TableCell className="text-right text-blue-500">
                          {summary?.total_needs || 0}
                        </TableCell>
                        <TableCell className="text-right text-green-500">
                          {summary?.total_accepted || 0}
                        </TableCell>
                        <TableCell className="text-right">
                          {summary && summary.total_needs > 0
                            ? ((summary.total_accepted / summary.total_needs) * 100).toFixed(1)
                            : '0.0'}%
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              ) : !loading ? (
                <div className="h-[400px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">暂无统计数据</p>
                    <p className="text-sm">请调整查询条件</p>
                  </div>
                </div>
              ) : (
                <div className="h-[400px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
