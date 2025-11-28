from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count
from django.db.models.functions import TruncMonth
from datetime import datetime, timedelta

from apps.needs.models import Need
from apps.responses.models import AcceptedMatch


class MonthlyStatisticsView(APIView):
    """月度统计数据"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # 获取查询参数
        start_month = request.query_params.get('start_month')
        end_month = request.query_params.get('end_month')
        region_id = request.query_params.get('region_id')
        service_type = request.query_params.get('service_type')
        
        # 默认显示近6个月
        if not end_month:
            end_date = datetime.now()
            end_month = end_date.strftime('%Y%m')
        if not start_month:
            start_date = datetime.now() - timedelta(days=180)
            start_month = start_date.strftime('%Y%m')
        
        # 解析月份为日期范围
        start_date = datetime.strptime(start_month + '01', '%Y%m%d')
        end_year = int(end_month[:4])
        end_mon = int(end_month[4:])
        if end_mon == 12:
            end_date = datetime(end_year + 1, 1, 1)
        else:
            end_date = datetime(end_year, end_mon + 1, 1)
        
        # 查询需求统计
        needs_query = Need.objects.filter(
            created_at__gte=start_date,
            created_at__lt=end_date,
            status=0
        )
        
        # 查询成功匹配统计
        matches_query = AcceptedMatch.objects.filter(
            accepted_date__gte=start_date.date(),
            accepted_date__lt=end_date.date()
        )
        
        # 应用筛选条件
        if region_id:
            needs_query = needs_query.filter(region_id=region_id)
            matches_query = matches_query.filter(region_id=region_id)
        if service_type:
            needs_query = needs_query.filter(service_type=service_type)
            matches_query = matches_query.filter(service_type=service_type)
        
        # 按月聚合需求数
        needs_by_month = needs_query.annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            count=Count('id')
        ).order_by('month')
        
        # 按月聚合成功匹配数
        matches_by_month = matches_query.extra(
            select={'month': "strftime('%%Y-%%m', accepted_date)"}
        ).values('month').annotate(
            count=Count('id')
        ).order_by('month')
        
        # 构建图表数据
        needs_dict = {item['month'].strftime('%Y-%m'): item['count'] for item in needs_by_month}
        matches_dict = {item['month']: item['count'] for item in matches_by_month}
        
        # 生成所有月份标签
        labels = []
        current = start_date
        while current < end_date:
            labels.append(current.strftime('%Y-%m'))
            if current.month == 12:
                current = datetime(current.year + 1, 1, 1)
            else:
                current = datetime(current.year, current.month + 1, 1)
        
        chart_data = {
            'labels': labels,
            'needs': [needs_dict.get(label, 0) for label in labels],
            'accepted': [matches_dict.get(label, 0) for label in labels],
        }
        
        return Response({
            'code': 200,
            'message': 'success',
            'data': {
                'chart_data': chart_data,
                'summary': {
                    'total_needs': sum(chart_data['needs']),
                    'total_accepted': sum(chart_data['accepted']),
                }
            }
        })


class OverviewView(APIView):
    """平台概览（管理员）"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # 检查是否是管理员
        if request.user.user_type != 'admin':
            return Response({
                'code': 403,
                'message': '仅管理员可访问'
            }, status=403)
        
        from apps.users.models import User
        
        total_users = User.objects.count()
        total_needs = Need.objects.filter(status=0).count()
        total_matches = AcceptedMatch.objects.count()
        
        return Response({
            'code': 200,
            'message': 'success',
            'data': {
                'total_users': total_users,
                'total_needs': total_needs,
                'total_matches': total_matches,
            }
        })
