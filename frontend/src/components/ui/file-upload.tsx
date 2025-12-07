'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone, Accept } from 'react-dropzone';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { IconX, IconPhoto, IconVideo, IconLoader2 } from '@tabler/icons-react';
import { toast } from 'sonner';

interface UploadedFile {
  url: string;
  filename: string;
  size: number;
  type: 'image' | 'video';
}

interface FileUploadProps {
  type: 'image' | 'video';
  multiple?: boolean;
  maxFiles?: number;
  value?: string[];
  onChange?: (urls: string[]) => void;
  className?: string;
}

export function FileUpload({
  type,
  multiple = true,
  maxFiles = 5,
  value = [],
  onChange,
  className,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>(() =>
    value.map(url => ({ url, filename: '', size: 0, type }))
  );
  const isInitialMount = useRef(true);
  const onChangeRef = useRef(onChange);

  // 保持 onChange 引用最新
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const accept: Accept = type === 'image' 
    ? { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/gif': ['.gif'], 'image/webp': ['.webp'] }
    : { 'video/mp4': ['.mp4'], 'video/webm': ['.webm'], 'video/quicktime': ['.mov'] };

  const maxSize = type === 'image' ? 5 * 1024 * 1024 : 50 * 1024 * 1024;

  // 使用 useEffect 同步状态到父组件，跳过首次渲染
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    onChangeRef.current?.(files.map(f => f.url));
  }, [files]); // 移除 onChange 依赖，使用 ref

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (files.length + acceptedFiles.length > maxFiles) {
      toast.error(`最多只能上传 ${maxFiles} 个文件`);
      return;
    }

    setUploading(true);

    for (const file of acceptedFiles) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        const response = await api.post('/needs/upload/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const uploadedFile: UploadedFile = {
          url: response.data.data.url,
          filename: response.data.data.filename,
          size: response.data.data.size,
          type: response.data.data.type,
        };

        setFiles(prev => [...prev, uploadedFile]);
        toast.success(`${file.name} 上传成功`);
      } catch (error: any) {
        const message = error.response?.data?.message || '上传失败';
        toast.error(`${file.name}: ${message}`);
      }
    }

    setUploading(false);
  }, [files.length, maxFiles, type]);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple,
    disabled: uploading || files.length >= maxFiles,
  });

  const Icon = type === 'image' ? IconPhoto : IconVideo;

  return (
    <div className={cn('space-y-4', className)}>
      {/* 上传区域 */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50',
          (uploading || files.length >= maxFiles) && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          {uploading ? (
            <IconLoader2 className="h-10 w-10 text-muted-foreground animate-spin" />
          ) : (
            <Icon className="h-10 w-10 text-muted-foreground" />
          )}
          <div className="text-sm text-muted-foreground">
            {isDragActive ? (
              <p>松开鼠标上传文件</p>
            ) : uploading ? (
              <p>正在上传...</p>
            ) : files.length >= maxFiles ? (
              <p>已达到最大上传数量</p>
            ) : (
              <>
                <p>
                  <span className="text-primary font-medium">点击上传</span> 或拖拽文件到此处
                </p>
                <p className="text-xs mt-1">
                  {type === 'image' 
                    ? '支持 JPG、PNG、GIF、WebP，单个文件最大 5MB'
                    : '支持 MP4、WebM、MOV，单个文件最大 50MB'
                  }
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 已上传文件列表 */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {files.map((file, index) => (
            <div key={index} className="relative group">
              {file.type === 'image' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={file.url}
                  alt={file.filename}
                  className="w-full h-24 object-cover rounded-lg border"
                />
              ) : (
                <video
                  src={file.url}
                  className="w-full h-24 object-cover rounded-lg border"
                />
              )}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFile(index)}
              >
                <IconX className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* 文件数量提示 */}
      <p className="text-xs text-muted-foreground text-right">
        {files.length} / {maxFiles} 个文件
      </p>
    </div>
  );
}

