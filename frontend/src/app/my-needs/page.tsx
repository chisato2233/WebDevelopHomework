'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import api from '@/lib/api';
import type { Need } from '@/types';

export default function MyNeedsPage() {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyNeeds = async () => {
    setLoading(true);
    try {
      const response = await api.get('/needs/my/');
      setNeeds(response.data.results || response.data);
    } catch (error) {
      console.error('获取我的需求失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyNeeds();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条需求吗？')) return;
    
    try {
      await api.delete(`/needs/${id}/`);
      fetchMyNeeds();
    } catch (error: any) {
      alert(error.response?.data?.message || '删除失败');
    }
  };

  const getStatusBadge = (need: Need) => {
    if (need.status === -1) {
      return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">已取消</span>;
    }
    return <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-sm">已发布</span>;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">我的需求</h1>
            <p className="text-gray-500 mt-1">管理您发布的服务需求</p>
          </div>
          <Link
            href="/my-needs/create"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span>➕</span> 发布新需求
          </Link>
        </div>

        {/* Needs List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">加载中...</p>
          </div>
        ) : needs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <span className="text-6xl">📝</span>
            <p className="mt-4 text-gray-500">您还没有发布任何需求</p>
            <Link
              href="/my-needs/create"
              className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              发布第一条需求
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {needs.map((need) => (
              <div
                key={need.id}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {need.service_type}
                      </span>
                      {getStatusBadge(need)}
                      {need.response_count && need.response_count > 0 && (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                          🔔 {need.response_count} 条响应
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/needs/${need.id}`}
                      className="text-xl font-semibold text-gray-800 hover:text-blue-600"
                    >
                      {need.title}
                    </Link>
                    <p className="mt-2 text-gray-600 line-clamp-2">
                      {need.description}
                    </p>
                    <div className="mt-4 text-sm text-gray-500">
                      📍 {need.region?.full_name || '未知地区'} · 
                      🕐 {new Date(need.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link
                      href={`/needs/${need.id}`}
                      className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                    >
                      查看
                    </Link>
                    {need.status === 0 && (!need.response_count || need.response_count === 0) && (
                      <>
                        <Link
                          href={`/my-needs/${need.id}/edit`}
                          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          编辑
                        </Link>
                        <button
                          onClick={() => handleDelete(need.id)}
                          className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                        >
                          删除
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

