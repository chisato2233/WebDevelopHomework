from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
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
