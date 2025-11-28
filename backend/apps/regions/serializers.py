from rest_framework import serializers
from .models import Region


class RegionSerializer(serializers.ModelSerializer):
    """地域序列化器"""
    
    class Meta:
        model = Region
        fields = ['id', 'name', 'city', 'province', 'full_name']

