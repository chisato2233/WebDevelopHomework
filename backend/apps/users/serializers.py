from rest_framework import serializers
from django.contrib.auth import get_user_model
from .validators import validate_password

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """用户信息序列化器"""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'phone', 'bio', 'user_type', 'date_joined', 'last_login']
        read_only_fields = ['id', 'username', 'user_type', 'date_joined', 'last_login']


class RegisterSerializer(serializers.ModelSerializer):
    """用户注册序列化器"""
    
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)
    
    full_name = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')
    
    class Meta:
        model = User
        fields = ['username', 'password', 'confirm_password', 'full_name', 'phone', 'bio']
    
    def validate_phone(self, value):
        if len(value) != 11 or not value.isdigit():
            raise serializers.ValidationError('手机号必须为11位数字')
        if not value.startswith('1'):
            raise serializers.ValidationError('请输入有效的手机号')
        return value
    
    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': '两次输入的密码不一致'})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            full_name=validated_data.get('full_name', ''),
            phone=validated_data['phone'],
            bio=validated_data.get('bio', ''),
        )
        return user


class LoginSerializer(serializers.Serializer):
    """登录序列化器"""
    
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class ChangePasswordSerializer(serializers.Serializer):
    """修改密码序列化器"""
    
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('原密码错误')
        return value


class UpdateProfileSerializer(serializers.ModelSerializer):
    """更新个人信息序列化器"""
    
    class Meta:
        model = User
        fields = ['phone', 'bio']
    
    def validate_phone(self, value):
        if len(value) != 11 or not value.isdigit():
            raise serializers.ValidationError('手机号必须为11位数字')
        return value

