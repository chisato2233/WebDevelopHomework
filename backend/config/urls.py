"""
URL configuration for config project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API 路由
    path('api/auth/', include('apps.users.urls')),
    path('api/regions/', include('apps.regions.urls')),
    path('api/needs/', include('apps.needs.urls')),
    path('api/responses/', include('apps.responses.urls')),
    path('api/statistics/', include('apps.stats.urls')),
]

# 开发环境下提供媒体文件访问
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
