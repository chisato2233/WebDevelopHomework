from django.urls import path
from .views import RegionListView, RegionDetailView

urlpatterns = [
    path('', RegionListView.as_view(), name='region-list'),
    path('<int:pk>/', RegionDetailView.as_view(), name='region-detail'),
]
