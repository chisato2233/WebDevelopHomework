"""
初始化测试数据脚本
运行方式: python manage.py shell < init_data.py
或者: python manage.py runscript init_data (需要安装 django-extensions)
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.regions.models import Region

User = get_user_model()

print("=" * 50)
print("开始初始化测试数据...")
print("=" * 50)

# 1. 创建管理员账号
print("\n[1/3] 创建管理员账号...")
admin_user, created = User.objects.get_or_create(
    username='admin',
    defaults={
        'full_name': '系统管理员',
        'phone': '13800000000',
        'bio': '好服务平台管理员',
        'user_type': 'admin',
        'is_staff': True,
        'is_superuser': True,
    }
)
if created:
    admin_user.set_password('Admin123')
    admin_user.save()
    print("  ✓ 管理员账号创建成功: admin / Admin123")
else:
    print("  - 管理员账号已存在")

# 2. 创建测试用户
print("\n[2/3] 创建测试用户...")
test_users = [
    {'username': 'zhangsan', 'full_name': '张三', 'phone': '13800000001', 'bio': '热心市民'},
    {'username': 'lisi', 'full_name': '李四', 'phone': '13800000002', 'bio': '专业维修师傅'},
    {'username': 'wangwu', 'full_name': '王五', 'phone': '13800000003', 'bio': '社区志愿者'},
]

for user_data in test_users:
    user, created = User.objects.get_or_create(
        username=user_data['username'],
        defaults={
            'full_name': user_data['full_name'],
            'phone': user_data['phone'],
            'bio': user_data['bio'],
            'user_type': 'normal',
        }
    )
    if created:
        user.set_password('Test1234')
        user.save()
        print(f"  ✓ 用户 {user_data['full_name']} 创建成功: {user_data['username']} / Test1234")
    else:
        print(f"  - 用户 {user_data['username']} 已存在")

# 3. 创建地域数据
print("\n[3/3] 创建地域数据...")
regions_data = [
    {'name': '西湖区', 'city': '杭州市', 'province': '浙江省'},
    {'name': '余杭区', 'city': '杭州市', 'province': '浙江省'},
    {'name': '拱墅区', 'city': '杭州市', 'province': '浙江省'},
    {'name': '滨江区', 'city': '杭州市', 'province': '浙江省'},
    {'name': '萧山区', 'city': '杭州市', 'province': '浙江省'},
    {'name': '鹿城区', 'city': '温州市', 'province': '浙江省'},
    {'name': '海曙区', 'city': '宁波市', 'province': '浙江省'},
    {'name': '越城区', 'city': '绍兴市', 'province': '浙江省'},
    {'name': '南湖区', 'city': '嘉兴市', 'province': '浙江省'},
    {'name': '吴兴区', 'city': '湖州市', 'province': '浙江省'},
]

for region_data in regions_data:
    region, created = Region.objects.get_or_create(
        name=region_data['name'],
        city=region_data['city'],
        province=region_data['province'],
        defaults={
            'full_name': f"{region_data['province']}-{region_data['city']}-{region_data['name']}"
        }
    )
    if created:
        print(f"  ✓ 地域 {region.full_name} 创建成功")
    else:
        print(f"  - 地域 {region.name} 已存在")

print("\n" + "=" * 50)
print("测试数据初始化完成！")
print("=" * 50)
print("\n账号信息：")
print("  管理员: admin / Admin123")
print("  测试用户: zhangsan / Test1234")
print("  测试用户: lisi / Test1234")
print("  测试用户: wangwu / Test1234")
print()

