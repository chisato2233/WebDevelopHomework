'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import api from '@/lib/api';
import type { ServiceResponse } from '@/types';

const STATUS_MAP: Record<number, { label: string; color: string }> = {
  0: { label: '待接受', color: 'bg-yellow-100 text-yellow-700' },
  1: { label: '已同意', color: 'bg-green-100 text-green-700' },
  2: { label: '已拒绝', color: 'bg-red-100 text-red-700' },
  3: { label: '已取消', color: 'bg-gray-100 text-gray-600' },
};

export default function MyResponsesPage() {
  const [responses, setResponses] = useState<ServiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const fetchMyResponses = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      
      const response = await api.get('/responses/my/', { params });
      setResponses(response.data.results || response.data);
    } catch (error) {
      console.error('获取我的响应失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyResponses();
  }, [statusFilter]);

  const handleDelete = async (id: number) => {
    if (!confirm('确定要取消这条响应吗？')) return;
    
    try {
      await api.delete(`/responses/${id}/`);
      fetchMyResponses();
    } catch (error: any) {
      alert(error.response?.data?.message || '操作失败');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">我的服务响应</h1>
          <p className="text-gray-500 mt-1">查看您提交的所有服务响应</p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === '' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setStatusFilter('0')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === '0' ? 'bg-yellow-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              待接受
            </button>
            <button
              onClick={() => setStatusFilter('1')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === '1' ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              已同意
            </button>
            <button
              onClick={() => setStatusFilter('2')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === '2' ? 'bg-red-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              已拒绝
            </button>
          </div>
        </div>

        {/* Responses List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">加载中...</p>
          </div>
        ) : responses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <span className="text-6xl">🤝</span>
            <p className="mt-4 text-gray-500">暂无响应记录</p>
            <Link
              href="/needs"
              className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              浏览需求，提供服务
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {responses.map((response) => (
              <div
                key={response.id}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_MAP[response.status]?.color}`}>
                        {STATUS_MAP[response.status]?.label}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {response.need?.service_type}
                      </span>
                    </div>
                    <Link
                      href={`/needs/${response.need?.id}`}
                      className="text-xl font-semibold text-gray-800 hover:text-blue-600"
                    >
                      响应需求：{response.need?.title}
                    </Link>
                    <p className="mt-2 text-gray-600 line-clamp-2">
                      {response.description}
                    </p>
                    <div className="mt-4 text-sm text-gray-500">
                      🕐 提交时间：{new Date(response.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link
                      href={`/needs/${response.need?.id}`}
                      className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                    >
                      查看需求
                    </Link>
                    {response.status === 0 && (
                      <>
                        <Link
                          href={`/my-responses/${response.id}/edit`}
                          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          编辑
                        </Link>
                        <button
                          onClick={() => handleDelete(response.id)}
                          className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                        >
                          取消
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

