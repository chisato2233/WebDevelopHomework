from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q, Count

from .models import Need
from .serializers import (
    NeedListSerializer,
    NeedDetailSerializer,
    NeedCreateSerializer,
    NeedUpdateSerializer,
    AdminNeedSerializer,
    AdminNeedUpdateSerializer,
    NeedResponseSerializer,
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


class AdminNeedListView(APIView):
    """管理员 - 需求列表"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # 检查是否是管理员
        if request.user.user_type != 'admin':
            return Response({
                'code': 403,
                'message': '仅管理员可访问'
            }, status=403)

        # 获取查询参数
        search = request.query_params.get('search', '')
        service_type = request.query_params.get('service_type', '')
        region_id = request.query_params.get('region_id', '')
        status_filter = request.query_params.get('status', '')
        user_id = request.query_params.get('user_id', '')
        ordering = request.query_params.get('ordering', 'id')
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))

        # 查询需求列表
        queryset = Need.objects.select_related('user', 'region').prefetch_related('responses')

        # 搜索过滤
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(user__username__icontains=search) |
                Q(user__full_name__icontains=search)
            )

        # 服务类型过滤
        if service_type:
            queryset = queryset.filter(service_type=service_type)

        # 地域过滤
        if region_id:
            queryset = queryset.filter(region_id=region_id)

        # 状态过滤
        if status_filter != '':
            queryset = queryset.filter(status=int(status_filter))

        # 用户过滤
        if user_id:
            queryset = queryset.filter(user_id=user_id)

        # 排序
        if ordering:
            queryset = queryset.order_by(ordering)

        # 分页
        total = queryset.count()
        start = (page - 1) * page_size
        end = start + page_size
        needs = queryset[start:end]

        serializer = AdminNeedSerializer(needs, many=True)

        return Response({
            'code': 200,
            'message': 'success',
            'data': {
                'results': serializer.data,
                'total': total,
                'page': page,
                'page_size': page_size,
                'total_pages': (total + page_size - 1) // page_size,
            }
        })


class AdminNeedDetailView(APIView):
    """管理员 - 需求详情/更新/删除"""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        # 检查是否是管理员
        if request.user.user_type != 'admin':
            return Response({
                'code': 403,
                'message': '仅管理员可访问'
            }, status=403)

        try:
            need = Need.objects.select_related('user', 'region').get(pk=pk)
        except Need.DoesNotExist:
            return Response({
                'code': 404,
                'message': '需求不存在'
            }, status=404)

        serializer = AdminNeedSerializer(need)
        return Response({
            'code': 200,
            'message': 'success',
            'data': serializer.data
        })

    def put(self, request, pk):
        # 检查是否是管理员
        if request.user.user_type != 'admin':
            return Response({
                'code': 403,
                'message': '仅管理员可访问'
            }, status=403)

        try:
            need = Need.objects.get(pk=pk)
        except Need.DoesNotExist:
            return Response({
                'code': 404,
                'message': '需求不存在'
            }, status=404)

        serializer = AdminNeedUpdateSerializer(need, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            need.refresh_from_db()
            return Response({
                'code': 200,
                'message': '更新成功',
                'data': AdminNeedSerializer(need).data
            })
        return Response({
            'code': 400,
            'message': '更新失败',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        # 检查是否是管理员
        if request.user.user_type != 'admin':
            return Response({
                'code': 403,
                'message': '仅管理员可访问'
            }, status=403)

        try:
            need = Need.objects.get(pk=pk)
        except Need.DoesNotExist:
            return Response({
                'code': 404,
                'message': '需求不存在'
            }, status=404)

        # 管理员可以强制删除（软删除）
        need.status = -1
        need.save()
        return Response({
            'code': 200,
            'message': '删除成功'
        })


class AdminNeedResponsesView(APIView):
    """管理员 - 获取需求关联的响应列表"""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        # 检查是否是管理员
        if request.user.user_type != 'admin':
            return Response({
                'code': 403,
                'message': '仅管理员可访问'
            }, status=403)

        try:
            need = Need.objects.get(pk=pk)
        except Need.DoesNotExist:
            return Response({
                'code': 404,
                'message': '需求不存在'
            }, status=404)

        # 获取该需求的所有响应
        responses = need.responses.select_related('user').order_by('-created_at')

        serializer = NeedResponseSerializer(responses, many=True)
        return Response({
            'code': 200,
            'message': 'success',
            'data': serializer.data
        })
