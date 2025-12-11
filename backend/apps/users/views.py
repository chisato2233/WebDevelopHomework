from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.db.models import Count, Q

from .serializers import (
    UserSerializer,
    RegisterSerializer,
    LoginSerializer,
    ChangePasswordSerializer,
    UpdateProfileSerializer,
    AdminUserSerializer,
    AdminUserUpdateSerializer,
)

User = get_user_model()


class RegisterView(APIView):
    """用户注册"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # 生成 Token
            refresh = RefreshToken.for_user(user)
            return Response({
                'code': 201,
                'message': '注册成功',
                'data': {
                    'id': user.id,
                    'username': user.username,
                    'full_name': user.full_name,
                    'token': str(refresh.access_token),
                    'refresh': str(refresh),
                }
            }, status=status.HTTP_201_CREATED)
        return Response({
            'code': 400,
            'message': '注册失败',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """用户登录"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            user = authenticate(username=username, password=password)
            
            if user is not None:
                refresh = RefreshToken.for_user(user)
                return Response({
                    'code': 200,
                    'message': '登录成功',
                    'data': {
                        'token': str(refresh.access_token),
                        'refresh': str(refresh),
                        'user': UserSerializer(user).data
                    }
                })
            return Response({
                'code': 401,
                'message': '用户名或密码错误'
            }, status=status.HTTP_401_UNAUTHORIZED)
        return Response({
            'code': 400,
            'message': '请求参数错误',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """用户登出"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception:
            pass
        return Response({
            'code': 200,
            'message': '登出成功'
        })


class ProfileView(APIView):
    """获取/更新个人信息"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response({
            'code': 200,
            'message': 'success',
            'data': serializer.data
        })
    
    def put(self, request):
        serializer = UpdateProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'code': 200,
                'message': '更新成功',
                'data': UserSerializer(request.user).data
            })
        return Response({
            'code': 400,
            'message': '更新失败',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    """修改密码"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            request.user.set_password(serializer.validated_data['new_password'])
            request.user.save()
            return Response({
                'code': 200,
                'message': '密码修改成功'
            })
        return Response({
            'code': 400,
            'message': '密码修改失败',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class AdminUserListView(APIView):
    """管理员 - 用户列表"""
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
        user_type = request.query_params.get('user_type', '')
        is_active = request.query_params.get('is_active', '')
        ordering = request.query_params.get('ordering', 'id')
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))

        # 查询用户列表，附带需求和响应数量
        queryset = User.objects.annotate(
            needs_count=Count('needs', distinct=True),
            responses_count=Count('service_responses', distinct=True)
        )

        # 搜索过滤
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(full_name__icontains=search) |
                Q(phone__icontains=search)
            )

        # 用户类型过滤
        if user_type:
            queryset = queryset.filter(user_type=user_type)

        # 状态过滤
        if is_active != '':
            queryset = queryset.filter(is_active=is_active.lower() == 'true')

        # 排序
        if ordering:
            queryset = queryset.order_by(ordering)

        # 分页
        total = queryset.count()
        start = (page - 1) * page_size
        end = start + page_size
        users = queryset[start:end]

        serializer = AdminUserSerializer(users, many=True)

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


class AdminUserDetailView(APIView):
    """管理员 - 用户详情/更新"""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        # 检查是否是管理员
        if request.user.user_type != 'admin':
            return Response({
                'code': 403,
                'message': '仅管理员可访问'
            }, status=403)

        try:
            user = User.objects.annotate(
                needs_count=Count('needs', distinct=True),
                responses_count=Count('service_responses', distinct=True)
            ).get(pk=pk)
        except User.DoesNotExist:
            return Response({
                'code': 404,
                'message': '用户不存在'
            }, status=404)

        serializer = AdminUserSerializer(user)
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
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({
                'code': 404,
                'message': '用户不存在'
            }, status=404)

        # 不能修改自己的管理员状态
        if user.id == request.user.id and 'user_type' in request.data:
            if request.data['user_type'] != request.user.user_type:
                return Response({
                    'code': 400,
                    'message': '不能修改自己的用户类型'
                }, status=400)

        serializer = AdminUserUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            # 重新查询以获取统计数据
            user = User.objects.annotate(
                needs_count=Count('needs', distinct=True),
                responses_count=Count('service_responses', distinct=True)
            ).get(pk=pk)
            return Response({
                'code': 200,
                'message': '更新成功',
                'data': AdminUserSerializer(user).data
            })
        return Response({
            'code': 400,
            'message': '更新失败',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
