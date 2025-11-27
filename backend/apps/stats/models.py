from django.db import models


class MonthlyStatistics(models.Model):
    """月度统计表"""
    
    month = models.CharField(
        max_length=6,
        verbose_name='月份（YYYYMM）'
    )
    region = models.ForeignKey(
        'regions.Region',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='地域'
    )
    region_name = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='地域名称'
    )
    service_type = models.CharField(
        max_length=50,
        verbose_name='服务类型'
    )
    total_needs = models.IntegerField(
        default=0,
        verbose_name='月累计发布需求数'
    )
    total_accepted = models.IntegerField(
        default=0,
        verbose_name='月累计响应成功数'
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
        db_table = 'monthly_statistics'
        verbose_name = '月度统计'
        verbose_name_plural = '月度统计'
        unique_together = ['month', 'region', 'service_type']
    
    def __str__(self):
        return f'{self.month} - {self.region_name} - {self.service_type}'
