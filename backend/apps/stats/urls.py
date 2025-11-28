from django.urls import path
from .views import MonthlyStatisticsView, OverviewView

urlpatterns = [
    path('monthly/', MonthlyStatisticsView.as_view(), name='monthly-stats'),
    path('overview/', OverviewView.as_view(), name='overview'),
]
