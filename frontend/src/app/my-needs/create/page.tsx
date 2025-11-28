'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import api from '@/lib/api';
import type { Region } from '@/types';

const SERVICE_TYPES = [
  '管道维修',
  '助老服务',
  '保洁服务',
  '就诊服务',
  '营养餐服务',
  '定期接送服务',
  '其他',
];

export default function CreateNeedPage() {
  const router = useRouter();
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    region: '',
    service_type: '',
    title: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await api.get('/regions/');
        setRegions(response.data);
      } catch (error) {
        console.error('获取地域失败:', error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (!confirm('确认发布这条需求吗？')) return;

    setLoading(true);
    try {
      await api.post('/needs/', {
        region: parseInt(formData.region),
        service_type: formData.service_type,
        title: formData.title,
        description: formData.description,
        images: [],
        videos: [],
      });
      alert('需求发布成功！');
      router.push('/my-needs');
    } catch (error: any) {
      alert(error.response?.data?.message || '发布失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">发布服务需求</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 服务类型 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                服务类型 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.service_type}
                onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">请选择服务类型</option>
                {SERVICE_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.service_type && (
                <p className="mt-1 text-sm text-red-500">{errors.service_type}</p>
              )}
            </div>

            {/* 地域 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                地域 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">请选择地域</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>{region.full_name}</option>
                ))}
              </select>
              {errors.region && (
                <p className="mt-1 text-sm text-red-500">{errors.region}</p>
              )}
            </div>

            {/* 标题 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                需求主题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="简要描述您的需求"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            {/* 描述 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                需求描述 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                placeholder="详细描述您的需求，包括时间、地点、具体要求等"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            {/* 按钮 */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? '发布中...' : '发布需求'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}

