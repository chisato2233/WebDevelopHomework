from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db import transaction

from .models import Response as ServiceResponse, AcceptedMatch
from django.db.models import Q
from .serializers import (
    ResponseListSerializer,
    ResponseDetailSerializer,
    ResponseCreateSerializer,
    ResponseUpdateSerializer,
    AdminResponseSerializer,
    AdminResponseUpdateSerializer,
)


class ResponseListCreateView(generics.ListCreateAPIView):
    """响应列表 & 创建"""
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ServiceResponse.objects.select_related('user', 'need')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ResponseCreateSerializer
        return ResponseListSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            response_obj = serializer.save()
            return Response({
                'code': 201,
                'message': '响应提交成功',
                'data': ResponseDetailSerializer(response_obj).data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'code': 400,
            'message': '提交失败',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class ResponseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """响应详情 & 修改 & 删除"""
    permission_classes = [IsAuthenticated]
    queryset = ServiceResponse.objects.select_related('user', 'need')
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ResponseUpdateSerializer
        return ResponseDetailSerializer
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        if instance.user != request.user:
            return Response({
                'code': 403,
                'message': '无权修改他人的响应'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if not instance.can_edit:
            return Response({
                'code': 400,
                'message': '该响应已被处理，无法修改'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'code': 200,
                'message': '修改成功',
                'data': ResponseDetailSerializer(instance).data
            })
        return Response({
            'code': 400,
            'message': '修改失败',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        if instance.user != request.user:
            return Response({
                'code': 403,
                'message': '无权删除他人的响应'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if not instance.can_delete:
            return Response({
                'code': 400,
                'message': '该响应已被处理，无法删除'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        instance.status = 3  # 已取消
        instance.save()
        return Response({
            'code': 200,
            'message': '删除成功'
        })


class MyResponseListView(generics.ListAPIView):
    """我的响应列表"""
    serializer_class = ResponseListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        status_filter = self.request.query_params.get('status')
        queryset = ServiceResponse.objects.filter(user=self.request.user).select_related('need')
        if status_filter is not None:
            queryset = queryset.filter(status=status_filter)
        return queryset


class MyAcceptedResponsesView(generics.ListAPIView):
    """已被接受的响应"""
    serializer_class = ResponseListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ServiceResponse.objects.filter(
            user=self.request.user,
            status=1
        ).select_related('need')


class NeedResponsesView(generics.ListAPIView):
    """需求的所有响应（需求发布者查看）"""
    serializer_class = ResponseDetailSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        need_id = self.kwargs.get('need_id')
        # 排除已取消的响应（status=3）
        return ServiceResponse.objects.filter(need_id=need_id).exclude(status=3).select_related('user', 'need')


class AcceptResponseView(APIView):
    """接受响应"""
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def post(self, request, pk):
        try:
            response_obj = ServiceResponse.objects.select_related('need').get(pk=pk)
        except ServiceResponse.DoesNotExist:
            return Response({
                'code': 404,
                'message': '响应不存在'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # 验证当前用户是需求发布者
        if response_obj.need.user != request.user:
            return Response({
                'code': 403,
                'message': '只有需求发布者可以接受响应'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if response_obj.status != 0:
            return Response({
                'code': 400,
                'message': '该响应已被处理'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 更新响应状态
        response_obj.status = 1
        response_obj.save()
        
        # 创建成功匹配记录
        AcceptedMatch.objects.create(
            need=response_obj.need,
            need_user=response_obj.need.user,
            response=response_obj,
            response_user=response_obj.user,
            accepted_date=timezone.now().date(),
            service_type=response_obj.need.service_type,
            region=response_obj.need.region,
        )
        
        return Response({
            'code': 200,
            'message': '已接受响应',
            'data': ResponseDetailSerializer(response_obj).data
        })


class RejectResponseView(APIView):
    """拒绝响应"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        try:
            response_obj = ServiceResponse.objects.select_related('need').get(pk=pk)
        except ServiceResponse.DoesNotExist:
            return Response({
                'code': 404,
                'message': '响应不存在'
            }, status=status.HTTP_404_NOT_FOUND)
        
        if response_obj.need.user != request.user:
            return Response({
                'code': 403,
                'message': '只有需求发布者可以拒绝响应'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if response_obj.status != 0:
            return Response({
                'code': 400,
                'message': '该响应已被处理'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        response_obj.status = 2
        response_obj.save()

        return Response({
            'code': 200,
            'message': '已拒绝响应',
            'data': ResponseDetailSerializer(response_obj).data
        })


class AdminResponseListView(APIView):
    """管理员 - 响应列表"""
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
        status_filter = request.query_params.get('status', '')
        need_id = request.query_params.get('need_id', '')
        user_id = request.query_params.get('user_id', '')
        ordering = request.query_params.get('ordering', 'id')
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))

        # 查询响应列表
        queryset = ServiceResponse.objects.select_related('user', 'need', 'need__user', 'need__region')

        # 搜索过滤
        if search:
            queryset = queryset.filter(
                Q(description__icontains=search) |
                Q(user__username__icontains=search) |
                Q(user__full_name__icontains=search) |
                Q(need__title__icontains=search)
            )

        # 状态过滤
        if status_filter != '':
            queryset = queryset.filter(status=int(status_filter))

        # 需求过滤
        if need_id:
            queryset = queryset.filter(need_id=need_id)

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
        responses = queryset[start:end]

        serializer = AdminResponseSerializer(responses, many=True)

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


class AdminResponseDetailView(APIView):
    """管理员 - 响应详情/更新/删除"""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        # 检查是否是管理员
        if request.user.user_type != 'admin':
            return Response({
                'code': 403,
                'message': '仅管理员可访问'
            }, status=403)

        try:
            response_obj = ServiceResponse.objects.select_related('user', 'need', 'need__user', 'need__region').get(pk=pk)
        except ServiceResponse.DoesNotExist:
            return Response({
                'code': 404,
                'message': '响应不存在'
            }, status=404)

        serializer = AdminResponseSerializer(response_obj)
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
            response_obj = ServiceResponse.objects.get(pk=pk)
        except ServiceResponse.DoesNotExist:
            return Response({
                'code': 404,
                'message': '响应不存在'
            }, status=404)

        serializer = AdminResponseUpdateSerializer(response_obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            response_obj.refresh_from_db()
            return Response({
                'code': 200,
                'message': '更新成功',
                'data': AdminResponseSerializer(response_obj).data
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
            response_obj = ServiceResponse.objects.get(pk=pk)
        except ServiceResponse.DoesNotExist:
            return Response({
                'code': 404,
                'message': '响应不存在'
            }, status=404)

        # 管理员可以强制删除（软删除，设为已取消）
        response_obj.status = 3
        response_obj.save()
        return Response({
            'code': 200,
            'message': '删除成功'
        })
