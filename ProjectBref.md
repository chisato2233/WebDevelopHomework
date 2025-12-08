<!-- This file provides guidance to Claude Code (claude.ai/code) -->
# 好服务平台 - 项目简报 (ProjectBref)

> **此文件供 AI Agent 快速了解项目全貌，请在修改项目结构、依赖、架构时同步更新本文件。**

---

## 项目概述

**好服务** 是一个社区服务供需匹配平台，连接服务需求者（"我需要"）和服务提供者（"我服务"），实现双向选择和确认机制。

**核心功能**：
- 用户注册/登录（含密码强度验证）
- 发布服务需求（支持图片、视频上传）
- 提交服务响应（支持图片、视频上传）
- 接受/拒绝响应
- 统计分析（按时间、地域、服务类型）

---

## 编程偏好 (重要)

**Agent 在编写代码时必须遵循以下规范：**

### 1. 禁止使用 Emoji
- 代码和 UI 中禁止使用 emoji 字符
- 图标统一使用第三方图标库：
  - 首选：`@tabler/icons-react`
  - 备选：`lucide-react`
- 示例：用 `<IconUser />` 代替用户 emoji

### 2. 优先使用 UI 组件库
- 优先使用 `shadcn/ui` 组件，避免手写原生 HTML 元素
- 已安装的组件位于 `frontend/src/components/ui/`
- 常用组件：Button, Card, Input, Select, Dialog, Table, Badge, Avatar 等
- 如需新组件，使用 `npx shadcn@latest add <component>` 添加

### 3. 页面文件行数限制
- 单个 page.tsx 文件行数上限：**600 行**
- 超过限制时，必须拆分为子组件：
  - 将常用组件抽取到 `/src/compoents/ui`目录
  - 将一些页面特定代码抽取为组件加到 `src/app/<current_page>/components/` 目录
  - 按功能模块拆分（如表单、列表、弹窗等）

**拆分示例**：
```
app/needs/
├── page.tsx              # 主页面 (控制在 600 行内)
├── _components/
│   ├── NeedsList.tsx     # 需求列表组件
│   ├── NeedsFilter.tsx   # 筛选组件
│   └── NeedCard.tsx      # 单个需求卡片
```

---

## 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| **前端框架** | Next.js (App Router) | 16.0.5 |
| **前端语言** | TypeScript + React | 5.x / 19.2.0 |
| **样式框架** | Tailwind CSS | 4.x |
| **UI组件库** | shadcn/ui (Radix UI) | 最新 |
| **图标库** | @tabler/icons-react | 3.35.0 |
| **后端框架** | Django + DRF | 5.0 / 3.16.1 |
| **ORM** | Django ORM | 内置 |
| **数据库** | SQLite3 | 3.x |
| **认证** | JWT (simplejwt) | 5.5.1 |

---

## 主要依赖

### 后端 (Python)
```
Django==5.0                          # Web框架
djangorestframework==3.16.1          # RESTful API
djangorestframework_simplejwt==5.5.1 # JWT认证
django-cors-headers==4.9.0           # 跨域处理
django-filter==25.1                  # 查询过滤
pillow==12.0.0                       # 图片处理
```

### 前端 (Node.js)
```
next@16.0.5              # React框架
react@19.2.0             # UI库
axios@1.13.2             # HTTP客户端
react-hook-form@7.66.1   # 表单处理
zod@4.1.13               # 数据验证
recharts@2.15.4          # 图表可视化
react-dropzone@14.3.8    # 文件上传
sonner@2.0.7             # Toast通知
@tabler/icons-react      # 图标库 (首选)
lucide-react@0.555.0     # 图标库 (备选)
framer-motion@12.23.24   # 动画库
reactnextplayer          # 视频播放器
```

---

## 架构设计

```
┌─────────────────────────────────────┐
│       前端 - Next.js 16             │
│   (localhost:3000)                  │
│   App Router + shadcn/ui            │
└──────────────┬──────────────────────┘
               │ REST API (JSON)
               │ Authorization: Bearer <JWT>
┌──────────────▼──────────────────────┐
│       后端 - Django 5.0 + DRF       │
│   (localhost:8000/api/)             │
│   ViewSets + Serializers            │
└──────────────┬──────────────────────┘
               │ Django ORM
┌──────────────▼──────────────────────┐
│       数据库 - SQLite3              │
│   (backend/db.sqlite3)              │
└─────────────────────────────────────┘
```

---

## 项目结构

```
WebDevelopHomework/
├── ProjectBref.md              # [本文件] 项目简报
├── backend/                    # Django 后端
│   ├── config/                 # 项目配置
│   │   ├── settings.py         # Django 设置
│   │   └── urls.py             # 根路由
│   ├── apps/                   # 应用模块
│   │   ├── users/              # 用户认证模块
│   │   ├── regions/            # 地域模块
│   │   ├── needs/              # "我需要"模块
│   │   │   ├── views.py        # 需求视图
│   │   │   ├── upload_views.py # 文件上传视图
│   │   │   └── stream_views.py # 媒体文件流视图 (支持视频拖动)
│   │   ├── responses/          # "我服务"模块
│   │   └── stats/              # 统计分析模块
│   ├── media/                  # 上传文件存储
│   ├── db.sqlite3              # SQLite 数据库
│   ├── requirements.txt        # Python 依赖
│   └── manage.py
│
├── frontend/                   # Next.js 前端
│   ├── src/
│   │   ├── app/                # App Router 页面
│   │   │   ├── login/          # 登录页
│   │   │   ├── register/       # 注册页
│   │   │   ├── dashboard/      # 仪表板
│   │   │   ├── needs/          # 浏览需求
│   │   │   │   └── [id]/       # 需求详情页
│   │   │   ├── my-needs/       # 我的需求
│   │   │   │   ├── create/     # 创建需求
│   │   │   │   └── [id]/edit/  # 编辑需求
│   │   │   ├── my-responses/   # 我的响应
│   │   │   │   └── [id]/edit/  # 编辑响应
│   │   │   └── profile/        # 个人信息
│   │   ├── components/         # 组件
│   │   │   ├── layout/         # 布局组件 (Header, MainLayout)
│   │   │   └── ui/             # shadcn/ui 组件
│   │   ├── hooks/              # 自定义 Hooks (useAuth)
│   │   ├── lib/                # 工具库 (api, validation)
│   │   └── types/              # TypeScript 类型定义
│   ├── package.json
│   └── tsconfig.json
│
└── docs/                       # 文档目录
    ├── 系统设计文档.md          # 详细设计文档
    ├── API接口文档.md           # API 接口说明
    └── 需求原文.md              # 原始需求文档
```

---

## API 端点概览

| 模块 | 端点前缀 | 主要功能 |
|------|----------|----------|
| 认证 | `/api/auth/` | 注册、登录、个人信息 |
| 地域 | `/api/regions/` | 地域列表查询 |
| 需求 | `/api/needs/` | 需求 CRUD、我的需求 |
| 文件上传 | `/api/needs/upload/` | 图片/视频上传 |
| 媒体流 | `/media/<path>` | 支持 Range 请求的媒体文件流 |
| 响应 | `/api/responses/` | 响应 CRUD、接受/拒绝 |
| 统计 | `/api/stats/` | 月度统计数据 |

**认证方式**：JWT Token  
**请求头**：`Authorization: Bearer <access_token>`

---

## 快速启动

### 后端
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver     # http://localhost:8000
```

### 前端
```bash
cd frontend
npm install
npm run dev                    # http://localhost:3000
```

---

## 相关文档

| 文档 | 路径 | 说明 |
|------|------|------|
| 系统设计文档 | `docs/系统设计文档.md` | 完整的系统设计，包含数据库、API、页面设计 |
| API接口文档 | `docs/API接口文档.md` | 详细的 API 接口说明 |
| 需求原文 | `docs/需求原文.md` | 原始功能需求 |

---

## Agent 更新指南

**当以下情况发生时，请更新本文件**：

1. **添加/删除依赖**：更新「主要依赖」章节
2. **新增/删除模块**：更新「项目结构」章节
3. **新增/修改 API**：更新「API 端点概览」章节
4. **技术栈变更**：更新「技术栈」章节
5. **架构调整**：更新「架构设计」章节
6. **编程规范变更**：更新「编程偏好」章节

**更新原则**：
- 保持简洁，只记录关键信息
- 使用表格和代码块提高可读性
- 确保版本号准确
- 禁止在本文件中使用 emoji

---

## 数据模型概览

```
User (用户)
├── id, username, password, user_type
├── full_name, phone, bio
└── created_at, updated_at

Region (地域)
├── id, name, city, province
└── full_name

Need (需求 - "我需要")
├── id, user_id, region_id
├── service_type, title, description
├── images, videos, status
└── created_at, updated_at

Response (响应 - "我服务")
├── id, need_id, user_id
├── description, images, videos
├── status (0待接受/1同意/2拒绝/3取消)
└── created_at, updated_at

AcceptedMatch (响应成功明细)
├── id, need_id, response_id
├── need_user_id, response_user_id
├── accepted_date, service_type, region_id
└── created_at

MonthlyStatistics (月度统计)
├── id, month, region_id, region_name
├── service_type, total_needs, total_accepted
└── created_at, updated_at
```

---

## 服务类型

| 代码 | 名称 |
|------|------|
| PIPE_REPAIR | 管道维修 |
| ELDERLY_CARE | 助老服务 |
| CLEANING | 保洁服务 |
| MEDICAL_ASSIST | 就诊服务 |
| MEAL_SERVICE | 营养餐服务 |
| TRANSPORT | 定期接送服务 |
| OTHER | 其他 |

---

*最后更新: 2025-12-09*
