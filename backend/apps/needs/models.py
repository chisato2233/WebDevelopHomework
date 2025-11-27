from django.db import models
from django.conf import settings


class Need(models.Model):
    """需求表 - "我需要" """
    
    SERVICE_TYPE_CHOICES = [
        ('管道维修', '管道维修'),
        ('助老服务', '助老服务'),
        ('保洁服务', '保洁服务'),
        ('就诊服务', '就诊服务'),
        ('营养餐服务', '营养餐服务'),
        ('定期接送服务', '定期接送服务'),
        ('其他', '其他'),
    ]
    
    STATUS_CHOICES = [
        (0, '已发布'),
        (-1, '已取消'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='needs',
        verbose_name='发布用户'
    )
    region = models.ForeignKey(
        'regions.Region',
        on_delete=models.SET_NULL,
        null=True,
        related_name='needs',
        verbose_name='地域'
    )
    service_type = models.CharField(
        max_length=50,
        choices=SERVICE_TYPE_CHOICES,
        verbose_name='服务类型'
    )
    title = models.CharField(
        max_length=200,
        verbose_name='需求主题'
    )
    description = models.TextField(
        verbose_name='需求描述'
    )
    images = models.JSONField(
        default=list,
        blank=True,
        verbose_name='图片路径'
    )
    videos = models.JSONField(
        default=list,
        blank=True,
        verbose_name='视频路径'
    )
    status = models.IntegerField(
        choices=STATUS_CHOICES,
        default=0,
        verbose_name='状态'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='创建时间'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='更新时间'
    )
    
    class Meta:
        db_table = 'needs'
        verbose_name = '服务需求'
        verbose_name_plural = '服务需求'
        ordering = ['-created_at']
    
    def __str__(self):
        return f'[{self.service_type}] {self.title}'
    
    @property
    def can_edit(self):
        """是否可以编辑（未被响应且状态正常）"""
        return self.status == 0 and self.responses.count() == 0
    
    @property
    def can_delete(self):
        """是否可以删除"""
        return self.can_edit
