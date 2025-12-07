from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """自定义用户模型"""
    
    USER_TYPE_CHOICES = [
        ('normal', '普通用户'),
        ('admin', '管理员'),
    ]
    
    user_type = models.CharField(
        max_length=20, 
        choices=USER_TYPE_CHOICES, 
        default='normal',
        verbose_name='用户类型'
    )
    full_name = models.CharField(
        max_length=100, 
        blank=True,
        default='',
        verbose_name='真实姓名'
    )
    phone = models.CharField(
        max_length=11, 
        verbose_name='手机号码'
    )
    bio = models.TextField(
        blank=True, 
        verbose_name='个人简介'
    )
    
    class Meta:
        db_table = 'users'
        verbose_name = '用户'
        verbose_name_plural = '用户'
    
    def __str__(self):
        return f'{self.username} ({self.full_name})'
