from django.urls import path
from .views import (
    ResponseListCreateView,
    ResponseDetailView,
    MyResponseListView,
    MyAcceptedResponsesView,
    NeedResponsesView,
    AcceptResponseView,
    RejectResponseView,
    AdminResponseListView,
    AdminResponseDetailView,
)

urlpatterns = [
    path('', ResponseListCreateView.as_view(), name='response-list'),
    path('<int:pk>/', ResponseDetailView.as_view(), name='response-detail'),
    path('my/', MyResponseListView.as_view(), name='my-responses'),
    path('my/accepted/', MyAcceptedResponsesView.as_view(), name='my-accepted'),
    path('need/<int:need_id>/', NeedResponsesView.as_view(), name='need-responses'),
    path('<int:pk>/accept/', AcceptResponseView.as_view(), name='accept-response'),
    path('<int:pk>/reject/', RejectResponseView.as_view(), name='reject-response'),
    # 管理员响应管理
    path('admin/', AdminResponseListView.as_view(), name='admin-response-list'),
    path('admin/<int:pk>/', AdminResponseDetailView.as_view(), name='admin-response-detail'),
]
