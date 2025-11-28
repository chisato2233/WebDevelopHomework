from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Need
from .serializers import (
    NeedListSerializer,
    NeedDetailSerializer,
    NeedCreateSerializer,
    NeedUpdateSerializer,
)


class NeedListCreateView(generics.ListCreateAPIView):
    """需求列表 & 创建"""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['service_type', 'region', 'status']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return Need.objects.filter(status=0).select_related('user', 'region')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return NeedCreateSerializer
        return NeedListSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            need = serializer.save()
            return Response({
                'code': 201,
                'message': '需求发布成功',
                'data': NeedDetailSerializer(need).data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'code': 400,
            'message': '发布失败',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class NeedDetailView(generics.RetrieveUpdateDestroyAPIView):
    """需求详情 & 修改 & 删除"""
    permission_classes = [IsAuthenticated]
    queryset = Need.objects.select_related('user', 'region')
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return NeedUpdateSerializer
        return NeedDetailSerializer
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # 只有发布者可以修改
        if instance.user != request.user:
            return Response({
                'code': 403,
                'message': '无权修改他人的需求'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if not instance.can_edit:
            return Response({
                'code': 400,
                'message': '该需求已有响应，无法修改'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'code': 200,
                'message': '修改成功',
                'data': NeedDetailSerializer(instance).data
            })
        return Response({
            'code': 400,
            'message': '修改失败',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # 只有发布者可以删除
        if instance.user != request.user:
            return Response({
                'code': 403,
                'message': '无权删除他人的需求'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if not instance.can_delete:
            return Response({
                'code': 400,
                'message': '该需求已有响应，无法删除'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        instance.status = -1  # 软删除
        instance.save()
        return Response({
            'code': 200,
            'message': '删除成功'
        })


class MyNeedListView(generics.ListAPIView):
    """我的需求列表"""
    serializer_class = NeedListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Need.objects.filter(user=self.request.user).select_related('user', 'region')
