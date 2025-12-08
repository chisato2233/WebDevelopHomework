"""
URL configuration for config project.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from apps.needs.stream_views import stream_media

urlpatterns = [
    path('admin/', admin.site.urls),

    # API 路由
    path('api/auth/', include('apps.users.urls')),
    path('api/regions/', include('apps.regions.urls')),
    path('api/needs/', include('apps.needs.urls')),
    path('api/responses/', include('apps.responses.urls')),
    path('api/statistics/', include('apps.stats.urls')),
]

# 媒体文件访问 - 使用支持 Range 请求的流视图
if settings.DEBUG:
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', stream_media, name='media-stream'),
    ]
