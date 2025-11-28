from django.urls import path
from .views import NeedListCreateView, NeedDetailView, MyNeedListView

urlpatterns = [
    path('', NeedListCreateView.as_view(), name='need-list'),
    path('<int:pk>/', NeedDetailView.as_view(), name='need-detail'),
    path('my/', MyNeedListView.as_view(), name='my-needs'),
]
