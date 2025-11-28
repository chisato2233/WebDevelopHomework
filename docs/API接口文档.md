# "好服务"平台 API 接口文档

> **版本**：v1.0  
> **基础URL**：`http://localhost:8001/api`  
> **认证方式**：JWT Bearer Token

---

## 目录

1. [通用说明](#一通用说明)
2. [认证模块](#二认证模块-auth)
3. [地域模块](#三地域模块-regions)
4. [需求模块](#四需求模块-needs)
5. [响应模块](#五响应模块-responses)
6. [统计模块](#六统计模块-statistics)

---

## 一、通用说明

### 1.1 请求头

需要认证的接口必须携带 Token：

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### 1.2 统一响应格式

**成功响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

**错误响应**：
```json
{
  "code": 400,
  "message": "错误描述",
  "errors": {
    "field_name": ["错误信息1", "错误信息2"]
  }
}
```

**分页响应**：
```json
{
  "count": 100,
  "next": "http://localhost:8001/api/needs/?page=2",
  "previous": null,
  "results": [ ... ]
}
```

### 1.3 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证/Token过期 |
| 403 | 无权限 |
| 404 | 资源不存在 |

---

## 二、认证模块 (auth)

### 2.1 用户注册

**POST** `/api/auth/register/`

**认证**：不需要

**请求体**：
```json
{
  "username": "zhangsan",
  "password": "Pass12ab",
  "confirm_password": "Pass12ab",
  "full_name": "张三",
  "phone": "13800138000",
  "bio": "热心市民"
}
```

**密码规则**：
- 不少于6位
- 必须包含至少2个数字
- 不能全部为大写或全部为小写

**成功响应** (201)：
```json
{
  "code": 201,
  "message": "注册成功",
  "data": {
    "id": 1,
    "username": "zhangsan",
    "full_name": "张三",
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

**错误响应** (400)：
```json
{
  "code": 400,
  "message": "注册失败",
  "errors": {
    "username": ["该用户名已存在"],
    "password": ["密码不少于6位", "密码必须包含至少2个数字"]
  }
}
```

---

### 2.2 用户登录

**POST** `/api/auth/login/`

**认证**：不需要

**请求体**：
```json
{
  "username": "zhangsan",
  "password": "Pass12ab"
}
```

**成功响应** (200)：
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "user": {
      "id": 1,
      "username": "zhangsan",
      "full_name": "张三",
      "phone": "13800138000",
      "bio": "热心市民",
      "user_type": "normal",
      "created_at": "2024-11-24T10:30:00Z",
      "updated_at": "2024-11-24T10:30:00Z"
    }
  }
}
```

**错误响应** (401)：
```json
{
  "code": 401,
  "message": "用户名或密码错误"
}
```

---

### 2.3 用户登出

**POST** `/api/auth/logout/`

**认证**：需要

**请求体**：
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**成功响应** (200)：
```json
{
  "code": 200,
  "message": "登出成功"
}
```

---

### 2.4 获取个人信息

**GET** `/api/auth/profile/`

**认证**：需要

**成功响应** (200)：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "zhangsan",
    "full_name": "张三",
    "phone": "13800138000",
    "bio": "热心市民",
    "user_type": "normal",
    "created_at": "2024-11-24T10:30:00Z",
    "updated_at": "2024-11-24T10:30:00Z"
  }
}
```

---

### 2.5 更新个人信息

**PUT** `/api/auth/profile/`

**认证**：需要

**请求体**（可选字段）：
```json
{
  "phone": "13900139000",
  "bio": "更新后的简介"
}
```

**成功响应** (200)：
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 1,
    "username": "zhangsan",
    "full_name": "张三",
    "phone": "13900139000",
    "bio": "更新后的简介",
    "user_type": "normal",
    "created_at": "2024-11-24T10:30:00Z",
    "updated_at": "2024-11-24T15:30:00Z"
  }
}
```

---

### 2.6 修改密码

**POST** `/api/auth/change-password/`

**认证**：需要

**请求体**：
```json
{
  "old_password": "Pass12ab",
  "new_password": "NewPass34"
}
```

**成功响应** (200)：
```json
{
  "code": 200,
  "message": "密码修改成功"
}
```

**错误响应** (400)：
```json
{
  "code": 400,
  "message": "密码修改失败",
  "errors": {
    "old_password": ["原密码错误"]
  }
}
```

---

### 2.7 刷新Token

**POST** `/api/auth/token/refresh/`

**认证**：不需要

**请求体**：
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**成功响应** (200)：
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

## 三、地域模块 (regions)

### 3.1 获取地域列表

**GET** `/api/regions/`

**认证**：需要

**查询参数**：
| 参数 | 类型 | 说明 |
|------|------|------|
| province | string | 按省份筛选 |
| city | string | 按城市筛选 |

**成功响应** (200)：
```json
[
  {
    "id": 1,
    "name": "西湖区",
    "city": "杭州市",
    "province": "浙江省",
    "full_name": "浙江省-杭州市-西湖区"
  },
  {
    "id": 2,
    "name": "余杭区",
    "city": "杭州市",
    "province": "浙江省",
    "full_name": "浙江省-杭州市-余杭区"
  }
]
```

---

### 3.2 获取地域详情

**GET** `/api/regions/{id}/`

**认证**：需要

**成功响应** (200)：
```json
{
  "id": 1,
  "name": "西湖区",
  "city": "杭州市",
  "province": "浙江省",
  "full_name": "浙江省-杭州市-西湖区"
}
```

---

## 四、需求模块 (needs)

### 4.1 获取需求列表

**GET** `/api/needs/`

**认证**：需要

**查询参数**：
| 参数 | 类型 | 说明 |
|------|------|------|
| service_type | string | 服务类型筛选 |
| region | integer | 地域ID筛选 |
| status | integer | 状态筛选（0:已发布, -1:已取消） |
| search | string | 搜索关键词（标题/描述） |
| page | integer | 页码，默认1 |
| ordering | string | 排序字段（created_at, -created_at） |

**成功响应** (200)：
```json
{
  "count": 25,
  "next": "http://localhost:8001/api/needs/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "user": {
        "id": 2,
        "username": "zhangsan",
        "full_name": "张三",
        "phone": "13800138000",
        "bio": "热心市民",
        "user_type": "normal",
        "created_at": "2024-11-24T10:30:00Z",
        "updated_at": "2024-11-24T10:30:00Z"
      },
      "region": {
        "id": 1,
        "name": "西湖区",
        "city": "杭州市",
        "province": "浙江省",
        "full_name": "浙江省-杭州市-西湖区"
      },
      "service_type": "管道维修",
      "title": "厨房水管漏水急需维修",
      "description": "厨房洗菜盆下方水管接头松动导致漏水...",
      "images": [],
      "videos": [],
      "status": 0,
      "response_count": 3,
      "created_at": "2024-11-24T10:30:00Z",
      "updated_at": "2024-11-24T10:30:00Z"
    }
  ]
}
```

---

### 4.2 发布需求

**POST** `/api/needs/`

**认证**：需要

**请求体**：
```json
{
  "region": 1,
  "service_type": "管道维修",
  "title": "厨房水管漏水急需维修",
  "description": "厨房洗菜盆下方水管接头松动导致漏水严重，急需专业师傅上门维修。",
  "images": [],
  "videos": []
}
```

**服务类型可选值**：
- 管道维修
- 助老服务
- 保洁服务
- 就诊服务
- 营养餐服务
- 定期接送服务
- 其他

**成功响应** (201)：
```json
{
  "code": 201,
  "message": "需求发布成功",
  "data": {
    "id": 1,
    "user": { ... },
    "region": { ... },
    "service_type": "管道维修",
    "title": "厨房水管漏水急需维修",
    "description": "...",
    "images": [],
    "videos": [],
    "status": 0,
    "response_count": 0,
    "can_edit": true,
    "can_delete": true,
    "created_at": "2024-11-24T10:30:00Z",
    "updated_at": "2024-11-24T10:30:00Z"
  }
}
```

---

### 4.3 获取需求详情

**GET** `/api/needs/{id}/`

**认证**：需要

**成功响应** (200)：
```json
{
  "id": 1,
  "user": { ... },
  "region": { ... },
  "service_type": "管道维修",
  "title": "厨房水管漏水急需维修",
  "description": "厨房洗菜盆下方水管接头松动...",
  "images": [],
  "videos": [],
  "status": 0,
  "response_count": 3,
  "can_edit": false,
  "can_delete": false,
  "created_at": "2024-11-24T10:30:00Z",
  "updated_at": "2024-11-24T10:30:00Z"
}
```

---

### 4.4 修改需求

**PUT/PATCH** `/api/needs/{id}/`

**认证**：需要（仅发布者可操作）

**业务规则**：只有未被响应的需求可以修改

**请求体**：
```json
{
  "title": "修改后的标题",
  "description": "修改后的描述"
}
```

**成功响应** (200)：
```json
{
  "code": 200,
  "message": "修改成功",
  "data": { ... }
}
```

**错误响应** (400)：
```json
{
  "code": 400,
  "message": "该需求已有响应，无法修改"
}
```

---

### 4.5 删除需求

**DELETE** `/api/needs/{id}/`

**认证**：需要（仅发布者可操作）

**业务规则**：只有未被响应的需求可以删除（软删除，设置status=-1）

**成功响应** (200)：
```json
{
  "code": 200,
  "message": "删除成功"
}
```

---

### 4.6 我的需求列表

**GET** `/api/needs/my/`

**认证**：需要

**成功响应** (200)：与需求列表格式相同，返回当前用户发布的所有需求

---

## 五、响应模块 (responses)

### 5.1 获取响应列表

**GET** `/api/responses/`

**认证**：需要

**成功响应** (200)：
```json
[
  {
    "id": 1,
    "need": 1,
    "need_title": "厨房水管漏水急需维修",
    "need_service_type": "管道维修",
    "user": { ... },
    "description": "我有10年水电维修经验...",
    "images": [],
    "videos": [],
    "status": 0,
    "created_at": "2024-11-24T11:00:00Z",
    "updated_at": "2024-11-24T11:00:00Z"
  }
]
```

---

### 5.2 提交响应

**POST** `/api/responses/`

**认证**：需要

**业务规则**：不能响应自己发布的需求

**请求体**：
```json
{
  "need": 1,
  "description": "我有10年水电维修经验，可以上门服务，价格公道。",
  "images": [],
  "videos": []
}
```

**成功响应** (201)：
```json
{
  "code": 201,
  "message": "响应提交成功",
  "data": {
    "id": 1,
    "need": { ... },
    "user": { ... },
    "description": "我有10年水电维修经验...",
    "images": [],
    "videos": [],
    "status": 0,
    "status_display": "待接受",
    "can_edit": true,
    "can_delete": true,
    "created_at": "2024-11-24T11:00:00Z",
    "updated_at": "2024-11-24T11:00:00Z"
  }
}
```

---

### 5.3 获取响应详情

**GET** `/api/responses/{id}/`

**认证**：需要

**成功响应** (200)：
```json
{
  "id": 1,
  "need": { ... },
  "user": { ... },
  "description": "我有10年水电维修经验...",
  "images": [],
  "videos": [],
  "status": 0,
  "status_display": "待接受",
  "can_edit": true,
  "can_delete": true,
  "created_at": "2024-11-24T11:00:00Z",
  "updated_at": "2024-11-24T11:00:00Z"
}
```

**响应状态说明**：
| status | status_display | 说明 |
|--------|----------------|------|
| 0 | 待接受 | 可修改/删除 |
| 1 | 已同意 | 不可修改 |
| 2 | 已拒绝 | 不可修改 |
| 3 | 已取消 | 用户主动取消 |

---

### 5.4 修改响应

**PUT/PATCH** `/api/responses/{id}/`

**认证**：需要（仅响应者可操作）

**业务规则**：只有待接受状态的响应可以修改

**请求体**：
```json
{
  "description": "修改后的描述"
}
```

**成功响应** (200)：
```json
{
  "code": 200,
  "message": "修改成功",
  "data": { ... }
}
```

---

### 5.5 删除响应

**DELETE** `/api/responses/{id}/`

**认证**：需要（仅响应者可操作）

**业务规则**：只有待接受状态的响应可以删除（设置status=3）

**成功响应** (200)：
```json
{
  "code": 200,
  "message": "删除成功"
}
```

---

### 5.6 我的响应列表

**GET** `/api/responses/my/`

**认证**：需要

**查询参数**：
| 参数 | 类型 | 说明 |
|------|------|------|
| status | integer | 按状态筛选 |

**成功响应** (200)：与响应列表格式相同

---

### 5.7 已被接受的响应

**GET** `/api/responses/my/accepted/`

**认证**：需要

**成功响应** (200)：返回当前用户已被接受（status=1）的响应列表

---

### 5.8 获取需求的所有响应

**GET** `/api/responses/need/{need_id}/`

**认证**：需要

**成功响应** (200)：返回指定需求的所有响应列表

---

### 5.9 接受响应

**POST** `/api/responses/{id}/accept/`

**认证**：需要（仅需求发布者可操作）

**成功响应** (200)：
```json
{
  "code": 200,
  "message": "已接受响应",
  "data": {
    "id": 1,
    "status": 1,
    "status_display": "已同意",
    ...
  }
}
```

**业务逻辑**：
1. 验证当前用户是需求发布者
2. 更新响应状态为1（已同意）
3. 创建 `accepted_matches` 记录
4. 可用于后续统计

---

### 5.10 拒绝响应

**POST** `/api/responses/{id}/reject/`

**认证**：需要（仅需求发布者可操作）

**成功响应** (200)：
```json
{
  "code": 200,
  "message": "已拒绝响应",
  "data": {
    "id": 1,
    "status": 2,
    "status_display": "已拒绝",
    ...
  }
}
```

---

## 六、统计模块 (statistics)

### 6.1 月度统计数据

**GET** `/api/statistics/monthly/`

**认证**：需要

**查询参数**：
| 参数 | 类型 | 说明 |
|------|------|------|
| start_month | string | 起始年月（YYYYMM），默认6个月前 |
| end_month | string | 终止年月（YYYYMM），默认当前月 |
| region_id | integer | 地域ID筛选 |
| service_type | string | 服务类型筛选 |

**示例请求**：
```
GET /api/statistics/monthly/?start_month=202406&end_month=202411
```

**成功响应** (200)：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "chart_data": {
      "labels": ["2024-06", "2024-07", "2024-08", "2024-09", "2024-10", "2024-11"],
      "needs": [45, 52, 48, 56, 61, 59],
      "accepted": [38, 41, 42, 48, 53, 51]
    },
    "summary": {
      "total_needs": 321,
      "total_accepted": 273
    }
  }
}
```

---

### 6.2 平台概览（管理员）

**GET** `/api/statistics/overview/`

**认证**：需要（仅管理员）

**成功响应** (200)：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total_users": 150,
    "total_needs": 321,
    "total_matches": 273
  }
}
```

**错误响应** (403)：
```json
{
  "code": 403,
  "message": "仅管理员可访问"
}
```

---

## 附录

### A. 测试账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | Admin123 |
| 测试用户 | zhangsan | Test1234 |
| 测试用户 | lisi | Test1234 |
| 测试用户 | wangwu | Test1234 |

### B. 快速测试

使用 curl 测试登录：

```bash
curl -X POST http://localhost:8001/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "zhangsan", "password": "Test1234"}'
```

使用 Token 获取需求列表：

```bash
curl http://localhost:8001/api/needs/ \
  -H "Authorization: Bearer <your_token>"
```

---

**文档版本**：v1.0  
**更新日期**：2024-11-27

