from django.urls import path
from .views import NeedListCreateView, NeedDetailView, MyNeedListView, AdminNeedListView, AdminNeedDetailView, AdminNeedResponsesView
from .upload_views import FileUploadView, MultiFileUploadView

urlpatterns = [
    path('', NeedListCreateView.as_view(), name='need-list'),
    path('<int:pk>/', NeedDetailView.as_view(), name='need-detail'),
    path('my/', MyNeedListView.as_view(), name='my-needs'),
    path('upload/', FileUploadView.as_view(), name='file-upload'),
    path('upload/multi/', MultiFileUploadView.as_view(), name='multi-file-upload'),
    # 管理员需求管理
    path('admin/', AdminNeedListView.as_view(), name='admin-need-list'),
    path('admin/<int:pk>/', AdminNeedDetailView.as_view(), name='admin-need-detail'),
    path('admin/<int:pk>/responses/', AdminNeedResponsesView.as_view(), name='admin-need-responses'),
]
