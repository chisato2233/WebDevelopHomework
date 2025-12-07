from rest_framework import serializers
from .models import Need
from apps.users.serializers import UserSerializer
from apps.regions.serializers import RegionSerializer


class NeedListSerializer(serializers.ModelSerializer):
    """需求列表序列化器"""
    user = UserSerializer(read_only=True)
    region = RegionSerializer(read_only=True)
    response_count = serializers.SerializerMethodField()
    accepted_count = serializers.SerializerMethodField()
    can_edit = serializers.ReadOnlyField()
    can_delete = serializers.ReadOnlyField()
    
    class Meta:
        model = Need
        fields = [
            'id', 'user', 'region', 'service_type', 'title', 
            'description', 'images', 'videos', 'status', 
            'response_count', 'accepted_count', 'can_edit', 'can_delete',
            'created_at', 'updated_at'
        ]
    
    def get_response_count(self, obj):
        # 只统计待接受(0)的新响应，用于显示"新响应"数量
        return obj.responses.filter(status=0).count()
    
    def get_accepted_count(self, obj):
        # 统计已同意(1)的响应数量
        return obj.responses.filter(status=1).count()


class NeedDetailSerializer(serializers.ModelSerializer):
    """需求详情序列化器"""
    user = UserSerializer(read_only=True)
    region = RegionSerializer(read_only=True)
    response_count = serializers.SerializerMethodField()
    accepted_count = serializers.SerializerMethodField()
    can_edit = serializers.ReadOnlyField()
    can_delete = serializers.ReadOnlyField()
    
    class Meta:
        model = Need
        fields = [
            'id', 'user', 'region', 'service_type', 'title',
            'description', 'images', 'videos', 'status',
            'response_count', 'accepted_count', 'can_edit', 'can_delete',
            'created_at', 'updated_at'
        ]
    
    def get_response_count(self, obj):
        # 只统计待接受(0)的新响应，用于显示"新响应"数量
        return obj.responses.filter(status=0).count()
    
    def get_accepted_count(self, obj):
        # 统计已同意(1)的响应数量
        return obj.responses.filter(status=1).count()


class NeedCreateSerializer(serializers.ModelSerializer):
    """创建需求序列化器"""
    
    class Meta:
        model = Need
        fields = ['region', 'service_type', 'title', 'description', 'images', 'videos']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class NeedUpdateSerializer(serializers.ModelSerializer):
    """更新需求序列化器"""
    
    class Meta:
        model = Need
        fields = ['region', 'service_type', 'title', 'description', 'images', 'videos']
    
    def validate(self, attrs):
        if not self.instance.can_edit:
            raise serializers.ValidationError('该需求已有响应，无法修改')
        return attrs

