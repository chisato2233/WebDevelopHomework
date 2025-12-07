"""文件上传视图"""
import os
import uuid
from datetime import datetime
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings


class FileUploadView(APIView):
    """文件上传接口"""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    # 允许的文件类型
    ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']
    MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB
    MAX_VIDEO_SIZE = 50 * 1024 * 1024  # 50MB
    
    def post(self, request):
        file = request.FILES.get('file')
        file_type = request.data.get('type', 'image')  # image 或 video
        
        if not file:
            return Response({
                'code': 400,
                'message': '请选择要上传的文件'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 验证文件类型
        content_type = file.content_type
        if file_type == 'image':
            if content_type not in self.ALLOWED_IMAGE_TYPES:
                return Response({
                    'code': 400,
                    'message': '不支持的图片格式，请上传 JPG、PNG、GIF 或 WebP 格式'
                }, status=status.HTTP_400_BAD_REQUEST)
            if file.size > self.MAX_IMAGE_SIZE:
                return Response({
                    'code': 400,
                    'message': '图片大小不能超过 5MB'
                }, status=status.HTTP_400_BAD_REQUEST)
        elif file_type == 'video':
            if content_type not in self.ALLOWED_VIDEO_TYPES:
                return Response({
                    'code': 400,
                    'message': '不支持的视频格式，请上传 MP4、WebM 或 MOV 格式'
                }, status=status.HTTP_400_BAD_REQUEST)
            if file.size > self.MAX_VIDEO_SIZE:
                return Response({
                    'code': 400,
                    'message': '视频大小不能超过 50MB'
                }, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({
                'code': 400,
                'message': '无效的文件类型'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 生成文件名和路径
        ext = os.path.splitext(file.name)[1].lower()
        date_path = datetime.now().strftime('%Y/%m')
        filename = f'{uuid.uuid4().hex}{ext}'
        
        # 根据文件类型选择存储目录
        if file_type == 'image':
            relative_path = f'images/{date_path}/{filename}'
        else:
            relative_path = f'videos/{date_path}/{filename}'
        
        full_path = os.path.join(settings.MEDIA_ROOT, relative_path)
        
        # 创建目录
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        
        # 保存文件
        with open(full_path, 'wb+') as destination:
            for chunk in file.chunks():
                destination.write(chunk)
        
        # 返回文件 URL
        file_url = f'{settings.MEDIA_URL}{relative_path}'
        
        return Response({
            'code': 200,
            'message': '上传成功',
            'data': {
                'url': file_url,
                'filename': file.name,
                'size': file.size,
                'type': file_type
            }
        })


class MultiFileUploadView(APIView):
    """批量文件上传接口"""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        files = request.FILES.getlist('files')
        file_type = request.data.get('type', 'image')
        
        if not files:
            return Response({
                'code': 400,
                'message': '请选择要上传的文件'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 使用单文件上传视图处理每个文件
        upload_view = FileUploadView()
        results = []
        errors = []
        
        for file in files:
            # 模拟单文件请求
            request._request.FILES['file'] = file
            request._data = {'type': file_type}
            
            # 验证和保存
            response = upload_view.post(request)
            if response.status_code == 200:
                results.append(response.data['data'])
            else:
                errors.append({
                    'filename': file.name,
                    'error': response.data['message']
                })
        
        return Response({
            'code': 200,
            'message': f'成功上传 {len(results)} 个文件',
            'data': {
                'uploaded': results,
                'errors': errors
            }
        })

