from django.db import models


class Region(models.Model):
    """地域表"""
    
    name = models.CharField(
        max_length=100,
        verbose_name='地域名称（区/县）'
    )
    city = models.CharField(
        max_length=50,
        blank=True,
        verbose_name='所属地市'
    )
    province = models.CharField(
        max_length=50,
        blank=True,
        verbose_name='所属省份'
    )
    full_name = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='完整名称（省-市-区）'
    )
    
    class Meta:
        db_table = 'regions'
        verbose_name = '地域'
        verbose_name_plural = '地域'
    
    def save(self, *args, **kwargs):
        # 自动生成完整名称
        if not self.full_name and self.province and self.city:
            self.full_name = f'{self.province}-{self.city}-{self.name}'
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.full_name or self.name
