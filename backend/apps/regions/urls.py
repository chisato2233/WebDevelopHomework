from django.urls import path
from .views import (
    RegionListView,
    RegionDetailView,
    AdminRegionListView,
    AdminRegionDetailView,
    AdminRegionProvincesView,
    AdminRegionCitiesView,
)

urlpatterns = [
    # 普通用户接口
    path('', RegionListView.as_view(), name='region-list'),
    path('<int:pk>/', RegionDetailView.as_view(), name='region-detail'),

    # 管理员接口
    path('admin/', AdminRegionListView.as_view(), name='admin-region-list'),
    path('admin/<int:pk>/', AdminRegionDetailView.as_view(), name='admin-region-detail'),
    path('admin/provinces/', AdminRegionProvincesView.as_view(), name='admin-region-provinces'),
    path('admin/cities/', AdminRegionCitiesView.as_view(), name='admin-region-cities'),
]
