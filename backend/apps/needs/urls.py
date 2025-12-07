from django.urls import path
from .views import NeedListCreateView, NeedDetailView, MyNeedListView
from .upload_views import FileUploadView, MultiFileUploadView

urlpatterns = [
    path('', NeedListCreateView.as_view(), name='need-list'),
    path('<int:pk>/', NeedDetailView.as_view(), name='need-detail'),
    path('my/', MyNeedListView.as_view(), name='my-needs'),
    path('upload/', FileUploadView.as_view(), name='file-upload'),
    path('upload/multi/', MultiFileUploadView.as_view(), name='multi-file-upload'),
]
