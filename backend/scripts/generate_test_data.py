"""
测试数据生成脚本

使用方法:
    cd backend
    python scripts/generate_test_data.py

生成的账号密码会保存到 backend/scripts/test_accounts.txt
"""

import os
import sys

# 添加项目根目录到 Python 路径
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)
sys.path.insert(0, BACKEND_DIR)

# 设置 Django 环境
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

import random
from datetime import datetime, timedelta

from django.contrib.auth import get_user_model
from apps.regions.models import Region
from apps.needs.models import Need
from apps.responses.models import Response, AcceptedMatch

User = get_user_model()

# 账号密码保存文件路径
ACCOUNTS_FILE = os.path.join(SCRIPT_DIR, 'test_accounts.txt')

# 存储生成的账号信息
generated_accounts = []

# ==================== 配置参数 ====================

# 是否清空现有数据（谨慎使用！）
CLEAR_EXISTING_DATA = True

# 数据量配置
NUM_REGIONS = 30          # 地域数量
NUM_USERS = 50            # 普通用户数量
NUM_ADMINS = 0            # 管理员数量
NUM_NEEDS = 200           # 需求数量
NUM_RESPONSES = 400       # 响应数量

# ==================== 测试数据定义 ====================

# 省份-城市-区县数据
REGION_DATA = [
    # 北京
    ('北京市', '北京市', ['朝阳区', '海淀区', '东城区', '西城区', '丰台区', '通州区', '顺义区', '大兴区']),
    # 上海
    ('上海市', '上海市', ['浦东新区', '黄浦区', '静安区', '徐汇区', '长宁区', '普陀区', '虹口区', '杨浦区']),
    # 广东
    ('广东省', '广州市', ['天河区', '越秀区', '海珠区', '荔湾区', '白云区', '番禺区']),
    ('广东省', '深圳市', ['福田区', '罗湖区', '南山区', '宝安区', '龙岗区', '龙华区']),
    ('广东省', '东莞市', ['莞城街道', '东城街道', '南城街道', '万江街道']),
    # 江苏
    ('江苏省', '南京市', ['玄武区', '秦淮区', '建邺区', '鼓楼区', '浦口区', '栖霞区']),
    ('江苏省', '苏州市', ['姑苏区', '虎丘区', '吴中区', '相城区', '吴江区']),
    # 浙江
    ('浙江省', '杭州市', ['上城区', '下城区', '江干区', '拱墅区', '西湖区', '滨江区']),
    ('浙江省', '宁波市', ['海曙区', '江北区', '北仑区', '镇海区', '鄞州区']),
    # 四川
    ('四川省', '成都市', ['锦江区', '青羊区', '金牛区', '武侯区', '成华区', '龙泉驿区']),
    # 湖北
    ('湖北省', '武汉市', ['江岸区', '江汉区', '硚口区', '汉阳区', '武昌区', '洪山区']),
    # 陕西
    ('陕西省', '西安市', ['新城区', '碑林区', '莲湖区', '雁塔区', '未央区', '灞桥区']),
]

# 服务类型
SERVICE_TYPES = ['管道维修', '助老服务', '保洁服务', '就诊服务', '营养餐服务', '定期接送服务', '其他']

# 需求标题模板
NEED_TITLES = {
    '管道维修': [
        '厨房水管漏水，急需维修',
        '卫生间下水道堵塞',
        '水龙头更换',
        '暖气管道漏水维修',
        '马桶水箱维修',
        '热水器管道安装',
    ],
    '助老服务': [
        '需要陪伴老人散步',
        '帮助老人购买日用品',
        '陪老人聊天解闷',
        '帮助老人整理房间',
        '教老人使用智能手机',
        '陪护老人看电视',
    ],
    '保洁服务': [
        '家庭日常保洁',
        '开荒保洁服务',
        '厨房深度清洁',
        '地毯清洗服务',
        '玻璃清洁服务',
        '空调清洗服务',
    ],
    '就诊服务': [
        '陪同就医挂号',
        '帮助取药送药',
        '陪护住院病人',
        '帮忙预约专家号',
        '协助办理住院手续',
        '陪同做检查',
    ],
    '营养餐服务': [
        '老年人营养餐配送',
        '糖尿病患者餐食定制',
        '术后康复餐配送',
        '每日三餐配送服务',
        '素食营养餐定制',
        '低盐低脂餐配送',
    ],
    '定期接送服务': [
        '每周接送老人去医院',
        '接送孩子上下学',
        '定期接送透析病人',
        '接送老人参加活动',
        '机场接送服务',
        '火车站接送服务',
    ],
    '其他': [
        '帮忙遛狗',
        '代收快递',
        '帮忙浇花',
        '宠物照看',
        '帮忙排队',
        '其他日常帮助',
    ],
}

# 需求描述模板
NEED_DESCRIPTIONS = {
    '管道维修': [
        '家中{location}管道出现问题，需要专业人员上门维修。希望能尽快解决，价格合理即可。',
        '{location}的管道漏水严重，已经影响到正常生活，急需专业师傅上门处理。',
        '管道老化需要更换，希望找有经验的师傅，最好能提供保修服务。',
    ],
    '助老服务': [
        '家中老人{age}岁，平时独居，希望能有人定期陪伴，聊聊天散散步。',
        '老人行动不便，需要有人帮忙购买日常用品，每周{times}次左右。',
        '希望找一位有耐心的人，帮助老人学习使用智能手机和微信。',
    ],
    '保洁服务': [
        '房屋面积约{area}平米，需要进行全面清洁，包括厨房和卫生间。',
        '刚装修完的新房，需要开荒保洁，要求仔细认真。',
        '定期需要保洁服务，每周{times}次，时间可以商量。',
    ],
    '就诊服务': [
        '老人需要去{hospital}就医，希望有人陪同挂号、排队、取药。',
        '家人住院期间需要陪护，时间{duration}，要求有责任心。',
        '需要帮忙预约{department}的专家号，自己不太会操作。',
    ],
    '营养餐服务': [
        '家中老人需要定制营养餐，要求{requirement}，每天配送。',
        '术后康复期间，需要营养均衡的餐食，口味清淡。',
        '糖尿病患者，需要低糖低盐的营养餐，长期服务优先。',
    ],
    '定期接送服务': [
        '每周需要接送老人去{destination}，时间固定在{time}。',
        '需要长期接送服务，往返{route}，要求准时可靠。',
        '老人行动不便，需要车辆接送就医，每月{times}次左右。',
    ],
    '其他': [
        '工作繁忙，需要帮忙{task}，费用可以商量。',
        '临时需要帮忙，具体事项可以电话沟通。',
        '需要日常帮助，有意者请联系详谈。',
    ],
}

# 响应描述模板
RESPONSE_DESCRIPTIONS = [
    '您好，我有{years}年相关服务经验，可以为您提供专业服务。时间方便，随时可以上门。',
    '我之前做过类似的工作，对这方面比较熟悉。可以先沟通一下具体需求。',
    '我是专业从事这项服务的，有相关证书，服务质量有保障。',
    '住在附近，方便上门服务。价格合理，欢迎咨询。',
    '我有丰富的经验，很多客户都给了好评。可以提供之前的服务案例参考。',
    '退休在家，时间充裕，做事认真负责。希望能帮到您。',
    '本人从事相关行业多年，技术过硬，服务态度好。期待为您服务。',
    '我可以提供这项服务，之前服务过很多家庭，经验丰富。',
]

# 中文姓氏和名字
SURNAMES = ['王', '李', '张', '刘', '陈', '杨', '黄', '赵', '周', '吴', '徐', '孙', '马', '朱', '胡', '郭', '何', '高', '林', '罗']
GIVEN_NAMES = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀兰', '霞', '平', '刚', '桂英']


# ==================== 工具函数 ====================

def generate_phone():
    """生成随机手机号"""
    prefixes = ['138', '139', '150', '151', '152', '157', '158', '159', '186', '187', '188', '189']
    return random.choice(prefixes) + ''.join([str(random.randint(0, 9)) for _ in range(8)])


def generate_chinese_name():
    """生成随机中文姓名"""
    surname = random.choice(SURNAMES)
    given_name = random.choice(GIVEN_NAMES)
    if random.random() > 0.5:
        given_name += random.choice(GIVEN_NAMES)
    return surname + given_name


def generate_username(index):
    """生成用户名"""
    prefixes = ['user', 'test', 'demo', 'sample', 'member']
    return f"{random.choice(prefixes)}_{index:04d}"


def random_date(start_date, end_date):
    """生成随机日期"""
    time_between = end_date - start_date
    days_between = time_between.days
    random_days = random.randint(0, days_between)
    return start_date + timedelta(days=random_days)


def fill_template(template, **kwargs):
    """填充模板中的占位符"""
    result = template
    placeholders = {
        'location': random.choice(['厨房', '卫生间', '阳台', '客厅', '卧室']),
        'age': str(random.randint(65, 85)),
        'times': str(random.randint(2, 5)),
        'area': str(random.randint(60, 150)),
        'hospital': random.choice(['市中心医院', '人民医院', '第一医院', '中医院']),
        'duration': random.choice(['白天', '晚上', '24小时']),
        'department': random.choice(['内科', '外科', '骨科', '心内科', '神经内科']),
        'requirement': random.choice(['低盐低脂', '高蛋白', '易消化', '清淡口味']),
        'destination': random.choice(['医院', '康复中心', '老年活动中心']),
        'time': random.choice(['上午9点', '下午2点', '早上8点']),
        'route': random.choice(['家到医院', '家到康复中心', '社区到医院']),
        'task': random.choice(['收快递', '遛狗', '浇花', '排队']),
        'years': str(random.randint(3, 15)),
    }
    placeholders.update(kwargs)
    for key, value in placeholders.items():
        result = result.replace('{' + key + '}', value)
    return result


# ==================== 数据生成函数 ====================

def clear_data():
    """清空现有数据"""
    print("清空现有数据...")
    AcceptedMatch.objects.all().delete()
    Response.objects.all().delete()
    Need.objects.all().delete()
    User.objects.filter(is_superuser=False).delete()
    Region.objects.all().delete()
    print("数据清空完成")


def create_regions():
    """创建地域数据"""
    print(f"\n创建地域数据...")
    regions = []
    count = 0

    for province, city, districts in REGION_DATA:
        for district in districts:
            if count >= NUM_REGIONS:
                break
            region = Region.objects.create(
                province=province,
                city=city,
                name=district,
                full_name=f"{province}-{city}-{district}"
            )
            regions.append(region)
            count += 1
        if count >= NUM_REGIONS:
            break

    print(f"已创建 {len(regions)} 个地域")
    return regions


def create_users():
    """创建用户数据"""
    global generated_accounts
    print(f"\n创建用户数据...")
    users = []
    admins = []

    # 创建管理员
    for i in range(NUM_ADMINS):
        username = f"admin_{i+1:02d}"
        password = 'admin123456'
        phone = generate_phone()
        full_name = f"管理员{i+1}"
        user = User.objects.create_user(
            username=username,
            password=password,
            email=f'{username}@example.com',
            phone=phone,
            full_name=full_name,
            user_type='admin',
            bio='系统管理员账号'
        )
        admins.append(user)
        # 记录账号信息
        generated_accounts.append({
            'type': '管理员',
            'username': username,
            'password': password,
            'full_name': full_name,
            'phone': phone,
        })
    if NUM_ADMINS > 0:
        print(f"已创建 {len(admins)} 个管理员 (用户名: admin_01 ~ admin_{NUM_ADMINS:02d}, 密码: admin123456)")

    # 创建普通用户
    for i in range(NUM_USERS):
        username = generate_username(i + 1)
        password = 'test123456'
        phone = generate_phone()
        full_name = generate_chinese_name()
        user = User.objects.create_user(
            username=username,
            password=password,
            email=f'{username}@example.com',
            phone=phone,
            full_name=full_name,
            user_type='normal',
            bio=random.choice([
                '热心社区志愿者',
                '退休职工，时间充裕',
                '专业服务人员',
                '社区居民',
                '兼职服务者',
                '',
            ])
        )
        users.append(user)
        # 记录账号信息
        generated_accounts.append({
            'type': '普通用户',
            'username': username,
            'password': password,
            'full_name': full_name,
            'phone': phone,
        })
    print(f"已创建 {len(users)} 个普通用户 (密码: test123456)")

    return users, admins


def create_needs(users, regions):
    """创建需求数据"""
    print(f"\n创建需求数据...")
    needs = []

    # 时间范围：过去12个月到现在
    end_date = datetime.now()
    start_date = end_date - timedelta(days=365)

    for i in range(NUM_NEEDS):
        user = random.choice(users)
        region = random.choice(regions)
        service_type = random.choice(SERVICE_TYPES)

        # 选择标题和描述
        title = random.choice(NEED_TITLES[service_type])
        description = fill_template(random.choice(NEED_DESCRIPTIONS[service_type]))

        # 随机状态（大部分为已发布）
        status = 0 if random.random() > 0.1 else -1

        # 随机创建时间
        created_at = random_date(start_date, end_date)

        need = Need(
            user=user,
            region=region,
            service_type=service_type,
            title=title,
            description=description,
            images=[],
            videos=[],
            status=status,
        )
        need.save()

        # 手动设置创建时间
        Need.objects.filter(pk=need.pk).update(created_at=created_at)
        need.refresh_from_db()

        needs.append(need)

        if (i + 1) % 50 == 0:
            print(f"  已创建 {i + 1} / {NUM_NEEDS} 个需求...")

    print(f"已创建 {len(needs)} 个需求")
    return needs


def create_responses(users, needs):
    """创建响应数据"""
    print(f"\n创建响应数据...")
    responses = []

    # 为需求分配响应
    active_needs = [n for n in needs if n.status == 0]

    for i in range(NUM_RESPONSES):
        # 随机选择一个需求
        need = random.choice(active_needs)

        # 选择一个不是需求发布者的用户作为响应者
        available_users = [u for u in users if u.id != need.user_id]
        if not available_users:
            continue
        user = random.choice(available_users)

        # 检查是否已经响应过
        if Response.objects.filter(need=need, user=user).exists():
            continue

        description = fill_template(random.choice(RESPONSE_DESCRIPTIONS))

        # 随机状态
        status_weights = [0.4, 0.3, 0.2, 0.1]  # 待接受、已同意、已拒绝、已取消
        status = random.choices([0, 1, 2, 3], weights=status_weights)[0]

        # 创建时间在需求之后
        created_at = need.created_at + timedelta(
            hours=random.randint(1, 72),
            minutes=random.randint(0, 59)
        )

        response = Response(
            need=need,
            user=user,
            description=description,
            images=[],
            videos=[],
            status=status,
        )
        response.save()

        # 手动设置创建时间
        Response.objects.filter(pk=response.pk).update(created_at=created_at)
        response.refresh_from_db()

        responses.append(response)

        # 如果是已同意状态，创建 AcceptedMatch 记录
        if status == 1:
            AcceptedMatch.objects.create(
                need=need,
                need_user=need.user,
                response=response,
                response_user=user,
                accepted_date=created_at.date(),
                service_type=need.service_type,
                region=need.region,
            )

        if (i + 1) % 100 == 0:
            print(f"  已创建 {i + 1} / {NUM_RESPONSES} 个响应...")

    print(f"已创建 {len(responses)} 个响应")

    # 统计已接受的响应
    accepted_count = Response.objects.filter(status=1).count()
    print(f"其中已接受的响应: {accepted_count} 个")

    return responses


def save_accounts_to_file():
    """将生成的账号密码保存到文件"""
    global generated_accounts

    if not generated_accounts:
        print("\n没有生成新账号，跳过保存")
        return

    print(f"\n保存账号信息到文件: {ACCOUNTS_FILE}")

    with open(ACCOUNTS_FILE, 'w', encoding='utf-8') as f:
        f.write("=" * 70 + "\n")
        f.write("Nexus 测试账号列表\n")
        f.write(f"生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("=" * 70 + "\n\n")

        # 分类统计
        admins = [a for a in generated_accounts if a['type'] == '管理员']
        users = [a for a in generated_accounts if a['type'] == '普通用户']

        # 管理员账号
        if admins:
            f.write("-" * 70 + "\n")
            f.write(f"管理员账号 ({len(admins)} 个)\n")
            f.write("-" * 70 + "\n")
            f.write(f"{'用户名':<20} {'密码':<15} {'姓名':<15} {'手机号':<15}\n")
            f.write("-" * 70 + "\n")
            for account in admins:
                f.write(f"{account['username']:<20} {account['password']:<15} {account['full_name']:<15} {account['phone']:<15}\n")
            f.write("\n")

        # 普通用户账号
        if users:
            f.write("-" * 70 + "\n")
            f.write(f"普通用户账号 ({len(users)} 个)\n")
            f.write("-" * 70 + "\n")
            f.write(f"{'用户名':<20} {'密码':<15} {'姓名':<15} {'手机号':<15}\n")
            f.write("-" * 70 + "\n")
            for account in users:
                f.write(f"{account['username']:<20} {account['password']:<15} {account['full_name']:<15} {account['phone']:<15}\n")
            f.write("\n")

        f.write("=" * 70 + "\n")
        f.write("快速登录:\n")
        if admins:
            f.write(f"  管理员: {admins[0]['username']} / {admins[0]['password']}\n")
        if users:
            f.write(f"  普通用户: {users[0]['username']} / {users[0]['password']}\n")
        f.write("=" * 70 + "\n")

    print(f"账号信息已保存到: {ACCOUNTS_FILE}")


def print_summary():
    """打印数据汇总"""
    print("\n" + "=" * 50)
    print("测试数据生成完成！数据汇总：")
    print("=" * 50)
    print(f"地域数量: {Region.objects.count()}")
    print(f"用户数量: {User.objects.count()} (管理员: {User.objects.filter(user_type='admin').count()})")
    print(f"需求数量: {Need.objects.count()} (已发布: {Need.objects.filter(status=0).count()})")
    print(f"响应数量: {Response.objects.count()}")
    print(f"  - 待接受: {Response.objects.filter(status=0).count()}")
    print(f"  - 已同意: {Response.objects.filter(status=1).count()}")
    print(f"  - 已拒绝: {Response.objects.filter(status=2).count()}")
    print(f"  - 已取消: {Response.objects.filter(status=3).count()}")
    print(f"成功匹配: {AcceptedMatch.objects.count()}")
    print("=" * 50)

    # 显示快速登录信息
    admins = [a for a in generated_accounts if a['type'] == '管理员']
    users = [a for a in generated_accounts if a['type'] == '普通用户']

    print("\n快速登录:")
    if admins:
        print(f"  管理员: {admins[0]['username']} / {admins[0]['password']}")
    if users:
        print(f"  普通用户: {users[0]['username']} / {users[0]['password']}")
    print(f"\n账号详情已保存到: {ACCOUNTS_FILE}")
    print("=" * 50)


# ==================== 主函数 ====================

def main():
    global generated_accounts
    generated_accounts = []  # 重置账号列表

    print("=" * 50)
    print("Nexus 测试数据生成脚本")
    print("=" * 50)

    if CLEAR_EXISTING_DATA:
        clear_data()

    # 按顺序生成数据
    regions = create_regions()
    users, admins = create_users()
    needs = create_needs(users, regions)
    responses = create_responses(users, needs)

    # 保存账号到文件
    save_accounts_to_file()

    print_summary()


if __name__ == '__main__':
    main()
