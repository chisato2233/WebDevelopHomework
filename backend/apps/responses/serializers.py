from rest_framework import serializers
from .models import Response as ServiceResponse, AcceptedMatch
from apps.users.serializers import UserSerializer
from apps.needs.serializers import NeedListSerializer


class ResponseListSerializer(serializers.ModelSerializer):
    """响应列表序列化器"""
    user = UserSerializer(read_only=True)
    need_title = serializers.CharField(source='need.title', read_only=True)
    need_service_type = serializers.CharField(source='need.service_type', read_only=True)
    
    class Meta:
        model = ServiceResponse
        fields = [
            'id', 'need', 'need_title', 'need_service_type', 'user',
            'description', 'images', 'videos', 'status',
            'created_at', 'updated_at'
        ]


class ResponseDetailSerializer(serializers.ModelSerializer):
    """响应详情序列化器"""
    user = UserSerializer(read_only=True)
    need = NeedListSerializer(read_only=True)
    can_edit = serializers.ReadOnlyField()
    can_delete = serializers.ReadOnlyField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = ServiceResponse
        fields = [
            'id', 'need', 'user', 'description', 'images', 'videos',
            'status', 'status_display', 'can_edit', 'can_delete',
            'created_at', 'updated_at'
        ]


class ResponseCreateSerializer(serializers.ModelSerializer):
    """创建响应序列化器"""
    
    class Meta:
        model = ServiceResponse
        fields = ['need', 'description', 'images', 'videos']
    
    def validate_need(self, value):
        if value.status != 0:
            raise serializers.ValidationError('该需求已取消，无法响应')
        if value.user == self.context['request'].user:
            raise serializers.ValidationError('不能响应自己发布的需求')
        return value
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ResponseUpdateSerializer(serializers.ModelSerializer):
    """更新响应序列化器"""
    
    class Meta:
        model = ServiceResponse
        fields = ['description', 'images', 'videos']
    
    def validate(self, attrs):
        if not self.instance.can_edit:
            raise serializers.ValidationError('该响应已被处理，无法修改')
        return attrs

