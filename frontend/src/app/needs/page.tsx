'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import api from '@/lib/api';
import type { Need, PaginatedResponse } from '@/types';

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

      const response = await api.get<PaginatedResponse<Need>>('/needs/', {
        params,
      });
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
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">浏览服务需求</h1>
            <p className="text-gray-500 mt-1">
              共 {totalCount} 条需求
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Service Type Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                服务类型
              </label>
              <select
                value={serviceType}
                onChange={(e) => {
                  setServiceType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {SERVICE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                搜索
              </label>
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="搜索需求标题或描述..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  搜索
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Needs List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">加载中...</p>
          </div>
        ) : needs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <span className="text-6xl">📭</span>
            <p className="mt-4 text-gray-500">暂无需求</p>
          </div>
        ) : (
          <div className="space-y-4">
            {needs.map((need) => (
              <div
                key={need.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {need.service_type}
                      </span>
                      {need.response_count && need.response_count > 0 && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                          {need.response_count} 条响应
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/needs/${need.id}`}
                      className="text-xl font-semibold text-gray-800 hover:text-blue-600 transition-colors"
                    >
                      {need.title}
                    </Link>
                    <p className="mt-2 text-gray-600 line-clamp-2">
                      {need.description}
                    </p>
                    <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                      <span>📍 {need.region?.full_name || '未知地区'}</span>
                      <span>👤 {need.user?.full_name}</span>
                      <span>
                        🕐 {new Date(need.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/needs/${need.id}`}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    查看详情
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            <span className="px-4 py-2 text-gray-600">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

