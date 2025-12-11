from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count
from .models import Region
from .serializers import RegionSerializer


class RegionListView(generics.ListAPIView):
    """获取地域列表"""
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Region.objects.all()
        province = self.request.query_params.get('province')
        city = self.request.query_params.get('city')

        if province:
            queryset = queryset.filter(province=province)
        if city:
            queryset = queryset.filter(city=city)

        return queryset


class RegionDetailView(generics.RetrieveAPIView):
    """获取地域详情"""
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    permission_classes = [IsAuthenticated]


# ============ Admin Views ============

class IsAdminUserType(IsAuthenticated):
    """检查是否为管理员用户类型"""
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return request.user.user_type == 'admin'


class AdminRegionListView(APIView):
    """管理员 - 地域列表（带统计）"""
    permission_classes = [IsAdminUserType]

    def get(self, request):
        queryset = Region.objects.annotate(
            needs_count=Count('needs', distinct=True)
        ).order_by('province', 'city', 'name')

        # 筛选
        province = request.query_params.get('province')
        city = request.query_params.get('city')
        search = request.query_params.get('search')

        if province:
            queryset = queryset.filter(province=province)
        if city:
            queryset = queryset.filter(city=city)
        if search:
            queryset = queryset.filter(
                full_name__icontains=search
            ) | queryset.filter(
                name__icontains=search
            )

        # 分页
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        total = queryset.count()

        start = (page - 1) * page_size
        end = start + page_size
        regions = queryset[start:end]

        data = []
        for region in regions:
            data.append({
                'id': region.id,
                'name': region.name,
                'city': region.city,
                'province': region.province,
                'full_name': region.full_name,
                'needs_count': region.needs_count,
            })

        return Response({
            'code': 200,
            'message': 'success',
            'data': {
                'results': data,
                'total': total,
                'page': page,
                'page_size': page_size,
                'total_pages': (total + page_size - 1) // page_size,
            }
        })

    def post(self, request):
        """创建地域"""
        serializer = RegionSerializer(data=request.data)
        if serializer.is_valid():
            region = serializer.save()
            return Response({
                'code': 200,
                'message': '创建成功',
                'data': RegionSerializer(region).data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'code': 400,
            'message': '创建失败',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class AdminRegionDetailView(APIView):
    """管理员 - 地域详情/编辑/删除"""
    permission_classes = [IsAdminUserType]

    def get_object(self, pk):
        try:
            return Region.objects.get(pk=pk)
        except Region.DoesNotExist:
            return None

    def get(self, request, pk):
        region = self.get_object(pk)
        if not region:
            return Response({
                'code': 404,
                'message': '地域不存在'
            }, status=status.HTTP_404_NOT_FOUND)

        # 统计该地域的需求数
        from apps.needs.models import Need
        needs_count = Need.objects.filter(region=region).count()

        data = RegionSerializer(region).data
        data['needs_count'] = needs_count

        return Response({
            'code': 200,
            'message': 'success',
            'data': data
        })

    def put(self, request, pk):
        region = self.get_object(pk)
        if not region:
            return Response({
                'code': 404,
                'message': '地域不存在'
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = RegionSerializer(region, data=request.data, partial=True)
        if serializer.is_valid():
            region = serializer.save()
            # 重新生成 full_name
            if region.province and region.city and region.name:
                region.full_name = f'{region.province}-{region.city}-{region.name}'
                region.save()
            return Response({
                'code': 200,
                'message': '更新成功',
                'data': RegionSerializer(region).data
            })
        return Response({
            'code': 400,
            'message': '更新失败',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        region = self.get_object(pk)
        if not region:
            return Response({
                'code': 404,
                'message': '地域不存在'
            }, status=status.HTTP_404_NOT_FOUND)

        # 检查是否有关联的需求
        from apps.needs.models import Need
        needs_count = Need.objects.filter(region=region).count()
        if needs_count > 0:
            return Response({
                'code': 400,
                'message': f'该地域下有 {needs_count} 个需求，无法删除'
            }, status=status.HTTP_400_BAD_REQUEST)

        region.delete()
        return Response({
            'code': 200,
            'message': '删除成功'
        })


class AdminRegionProvincesView(APIView):
    """管理员 - 获取所有省份列表"""
    permission_classes = [IsAdminUserType]

    def get(self, request):
        provinces = Region.objects.values_list('province', flat=True).distinct().order_by('province')
        return Response({
            'code': 200,
            'message': 'success',
            'data': list(provinces)
        })


class AdminRegionCitiesView(APIView):
    """管理员 - 获取指定省份的城市列表"""
    permission_classes = [IsAdminUserType]

    def get(self, request):
        province = request.query_params.get('province')
        queryset = Region.objects.values_list('city', flat=True).distinct()
        if province:
            queryset = queryset.filter(province=province)
        cities = queryset.order_by('city')
        return Response({
            'code': 200,
            'message': 'success',
            'data': list(cities)
        })
