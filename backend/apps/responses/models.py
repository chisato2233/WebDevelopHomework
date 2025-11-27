from django.db import models
from django.conf import settings


class Response(models.Model):
    """响应表 - "我服务" """
    
    STATUS_CHOICES = [
        (0, '待接受'),
        (1, '已同意'),
        (2, '已拒绝'),
        (3, '已取消'),
    ]
    
    need = models.ForeignKey(
        'needs.Need',
        on_delete=models.CASCADE,
        related_name='responses',
        verbose_name='响应的需求'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='service_responses',
        verbose_name='响应用户'
    )
    description = models.TextField(
        verbose_name='响应描述'
    )
    images = models.JSONField(
        default=list,
        blank=True,
        verbose_name='介绍图片'
    )
    videos = models.JSONField(
        default=list,
        blank=True,
        verbose_name='介绍视频'
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
        db_table = 'responses'
        verbose_name = '服务响应'
        verbose_name_plural = '服务响应'
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.user.username} 响应 [{self.need.title}]'
    
    @property
    def can_edit(self):
        """是否可以编辑（待接受状态）"""
        return self.status == 0
    
    @property
    def can_delete(self):
        """是否可以删除"""
        return self.status == 0


class AcceptedMatch(models.Model):
    """响应成功明细表"""
    
    need = models.ForeignKey(
        'needs.Need',
        on_delete=models.CASCADE,
        related_name='accepted_matches',
        verbose_name='需求'
    )
    need_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='need_matches',
        verbose_name='需求发布者'
    )
    response = models.OneToOneField(
        Response,
        on_delete=models.CASCADE,
        related_name='accepted_match',
        verbose_name='响应'
    )
    response_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='response_matches',
        verbose_name='响应者'
    )
    accepted_date = models.DateField(
        verbose_name='接受日期'
    )
    service_type = models.CharField(
        max_length=50,
        verbose_name='服务类型'
    )
    region = models.ForeignKey(
        'regions.Region',
        on_delete=models.SET_NULL,
        null=True,
        verbose_name='地域'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='创建时间'
    )
    
    class Meta:
        db_table = 'accepted_matches'
        verbose_name = '响应成功明细'
        verbose_name_plural = '响应成功明细'
    
    def __str__(self):
        return f'{self.need.title} - {self.response_user.username}'
