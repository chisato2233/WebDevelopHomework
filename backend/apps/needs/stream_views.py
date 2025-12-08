"""支持 HTTP Range 请求的媒体文件流视图"""
import os
import re
import mimetypes
from django.http import StreamingHttpResponse, HttpResponse, Http404
from django.conf import settings


def stream_media(request, path):
    """
    支持 Range 请求的媒体文件流视图
    允许视频拖动进度条
    """
    # 构建完整文件路径
    file_path = os.path.join(settings.MEDIA_ROOT, path)

    # 检查文件是否存在
    if not os.path.exists(file_path):
        raise Http404("文件不存在")

    # 获取文件大小和类型
    file_size = os.path.getsize(file_path)
    content_type, _ = mimetypes.guess_type(file_path)
    content_type = content_type or 'application/octet-stream'

    # 解析 Range 请求头
    range_header = request.META.get('HTTP_RANGE', '').strip()
    range_match = re.match(r'bytes=(\d+)-(\d*)', range_header)

    if range_match:
        # 处理 Range 请求
        start = int(range_match.group(1))
        end = int(range_match.group(2)) if range_match.group(2) else file_size - 1

        # 确保范围有效
        if start >= file_size:
            return HttpResponse(status=416)  # Range Not Satisfiable

        end = min(end, file_size - 1)
        length = end - start + 1

        # 创建流式响应
        response = StreamingHttpResponse(
            file_iterator(file_path, start, end),
            status=206,  # Partial Content
            content_type=content_type
        )
        response['Content-Length'] = length
        response['Content-Range'] = f'bytes {start}-{end}/{file_size}'
    else:
        # 完整文件请求
        response = StreamingHttpResponse(
            file_iterator(file_path, 0, file_size - 1),
            content_type=content_type
        )
        response['Content-Length'] = file_size

    # 添加必要的响应头
    response['Accept-Ranges'] = 'bytes'
    response['Access-Control-Allow-Origin'] = '*'
    response['Access-Control-Allow-Headers'] = 'Range'
    response['Access-Control-Expose-Headers'] = 'Content-Range, Content-Length, Accept-Ranges'

    return response


def file_iterator(file_path, start, end, chunk_size=8192):
    """文件分块读取迭代器"""
    with open(file_path, 'rb') as f:
        f.seek(start)
        remaining = end - start + 1
        while remaining > 0:
            chunk = f.read(min(chunk_size, remaining))
            if not chunk:
                break
            remaining -= len(chunk)
            yield chunk
