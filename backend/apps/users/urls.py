from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # TODO: 添加用户相关路由
    # path('register/', RegisterView.as_view(), name='register'),
    # path('login/', LoginView.as_view(), name='login'),
    # path('logout/', LogoutView.as_view(), name='logout'),
    # path('profile/', ProfileView.as_view(), name='profile'),
    # path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

