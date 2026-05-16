<p align="center">
  <img src="https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen?logo=springboot" alt="Spring Boot">
  <img src="https://img.shields.io/badge/JDK-17-orange?logo=openjdk" alt="JDK 17">
  <img src="https://img.shields.io/badge/React-18-blue?logo=react" alt="React 18">
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/MyBatis%20Plus-3.5.5-red?logo=mybatis" alt="MyBatis-Plus">
  <img src="https://img.shields.io/badge/H2-MySQL%20%E5%8F%AF%E5%88%87-blue" alt="H2/MySQL">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License">
</p>

<h1 align="center">Project Tracker</h1>
<h3 align="center">项目事项跟踪工具</h3>

<p align="center">
  一个面向软件团队的项目全生命周期管理平台，<br>
  覆盖版本跟踪、专项跟踪、Oncall 排班、项目看板、系统管理等场景。
</p>

---

## 📖 目录

- [功能概览](#-功能概览)
- [技术架构](#-技术架构)
- [快速开始](#-快速开始)
- [开发指南](#-开发指南)
- [API 文档](#-api-文档)
- [数据库设计](#-数据库设计)
- [部署运维](#-部署运维)
- [系统安全](#-系统安全)
- [主题系统](#-主题系统)
- [项目结构](#-项目结构)
- [贡献指南](#-贡献指南)
- [FAQ](#-faq)
- [更新日志](#-更新日志)
- [License](#-license)

---

## 🎯 功能概览

### 1. 人员与角色管理

| 功能 | 说明 |
|------|------|
| 人员 CRUD | 工号、姓名、邮箱管理，支持搜索和按角色筛选 |
| 角色分配 | 多角色穿梭框分配，支持角色级联筛选 |
| Excel 导入导出 | 含角色列，导入自动解析角色编码并分配 |
| 密码管理 | PBKDF2WithHmacSHA256 加密，首次登录强制改密码 |

### 2. 版本跟踪

软件版本从需求串讲到上线的完整生命周期管理：

```
需求串讲 → 需求设计 → 需求评审 → 研发串讲
    → 测试串讲 → 需求开发 → 需求转测 → 版本发布
        → 发布前检查 → 灰度发布 → 正式发布
```

**核心特性**：
- 树形阶段结构，支持三级嵌套
- 每个节点可配置责任人和截止日期
- 时间约束校验：子项日期 ≤ 父项日期 ≤ 版本上线时间
- 级联勾选：父项完成 → 所有子项自动完成
- 全部阶段完成 → 版本自动标记「已上线」
- 剩余天数/超期天数实时显示（绿色/红色）
- 复制版本（含完整阶段树和需求）
- Excel 导入导出三层模板（版本信息 + 版本需求 + 阶段）

### 3. 专项跟踪

面向周例会的专项风险管理：

- 里程碑管理（目标日期 + 实际完成 + 超期倒计时）
- 风险嵌套在里程碑下（严重程度 / 状态 / 责任人 / 闭环时间 / 处理进度）
- 全部风险解决 → 里程碑自动完成
- 责任人支持角色筛选 + 多选人员 + 自定义输入
- 风险按严重程度和闭环时间排序

### 4. Oncall 排班

- 按月指定 Oncall 负责人和备份人员
- 人员选择器从人员管理实时拉取

### 5. 项目看板

iPhone 风格日历聚合视图：

| 视图 | 说明 |
|------|------|
| 年视图 | 12 宫格，每月显示彩色圆点和事项计数 |
| 月视图 | 7 列日历网格，事项按天显示为色条 |

**色条图例**（可点击开关）：
- 🔵 蓝色 — 版本
- 🟢 绿色 — Oncall
- 🟣 紫色 — 专项
- 🟠 橙色 — 里程碑

### 6. 系统管理

#### 备份管理
- **通用 JSON 备份**：动态发现所有用户表 → `SELECT *` → Jackson 序列化
- **异步执行**：备份/恢复不阻塞请求，前端实时显示进度条
- **定时自动备份**：每天 0:00 和 12:00（Cron 可配置）
- **手动备份**：一键触发，实时进度
- **备份恢复**：选择历史备份文件 → 覆盖还原（带确认弹窗）
- **自动清理**：30 天前的备份文件自动删除
- **跨数据库**：不依赖数据库特定命令，H2 和 MySQL 通用

#### 访问记录
- 自动记录所有 API 请求（用户、IP、方法、路径、User-Agent）
- 支持清理一周前的记录

### 7. 登录与权限

| 特性 | 实现 |
|------|------|
| 密码加密 | PBKDF2WithHmacSHA256（10000 次迭代，16 字节随机盐） |
| 验证码 | 4 位数字图形验证码，点击刷新 |
| 记住密码 | localStorage 加密存储 |
| 7 天免登录 | Cookie + 数据库 Token 双重验证 |
| 强制登录 | 未登录自动跳转登录页，后端 401 |
| 游客模式 | guest/guest，仅查询，所有操作按钮置灰 |
| 管理员 | admin/admin，全部权限，不强制改密码 |
| 普通用户 | 初始密码 123456，首次登录强制修改 |

---

## 🏗 技术架构

```
┌──────────────────────────────────────────────┐
│                    浏览器                      │
│          React 18 + Ant Design 5 + TS        │
│     Vite Dev Server (5173) / Static Files    │
└──────────────────┬───────────────────────────┘
                   │ HTTP / JSON
                   │ axios + Proxy
┌──────────────────▼───────────────────────────┐
│             Spring Boot 3.2.5 (8080)          │
│  ┌──────────────────────────────────────┐    │
│  │        Controller Layer              │    │
│  │  Auth / Personnel / Version / ...    │    │
│  ├──────────────────────────────────────┤    │
│  │         Service Layer                │    │
│  │  Business Logic + PBKDF2 + Backup    │    │
│  ├──────────────────────────────────────┤    │
│  │         Mapper Layer                 │    │
│  │  MyBatis-Plus + XML (复杂查询)        │    │
│  ├──────────────────────────────────────┤    │
│  │         Filter / Interceptor         │    │
│  │  AuthInterceptor / AccessLogFilter   │    │
│  └──────────────────────────────────────┘    │
└──────────────────┬───────────────────────────┘
                   │ JDBC
┌──────────────────▼───────────────────────────┐
│             H2 (开发) / MySQL (生产)          │
└──────────────────────────────────────────────┘
```

**设计理念**：

| 原则 | 实现 |
|------|------|
| 简单查询 MyBatis-Plus | `LambdaQueryWrapper` + `BaseMapper.selectPage/selectList` |
| 复杂查询原生 SQL | `mapper/*.xml`，三层嵌套联查用 `resultMap` + `collection` |
| 前端模块化 | 工具注册机制，新增页面只需一行 `import` |
| 数据库无关 | 备份/恢复用标准 JDBC + JSON，不依赖特定数据库命令 |
| 外键解耦 | 所有表移除数据库级外键约束，只用逻辑 ID 关联 |

---

## 🚀 快速开始

### 环境要求

| 工具 | 最低版本 | 说明 |
|------|---------|------|
| JDK | 17 | 开发需要 JDK，服务器只需 JRE 17 |
| Maven | 3.9 | 后端构建 |
| Node.js | 18 | 前端开发 |
| npm | 9 | 前端依赖管理 |

### 本地启动

```bash
# 1. 克隆项目
git clone https://github.com/your-org/project-tracker.git
cd project-tracker

# 2. 启动后端（H2 文件模式，重启不丢数据）
cd backend
mvn spring-boot:run
# 后端运行在 http://localhost:8080

# 3. 新开终端，启动前端
cd frontend
npm install
npm run dev
# 前端运行在 http://localhost:5173
```

### 访问系统

浏览器打开 `http://localhost:5173`

| 账户 | 密码 | 权限 |
|------|------|------|
| `admin` | `admin` | 全部权限，不强制改密码 |
| `guest` | `guest` | 仅查询，按钮置灰 |
| `E001` | `123456` | 版本负责人 + 管理员，首次需改密码 |

### H2 控制台

浏览器打开 `http://localhost:8080/h2-console`

| 参数 | 值 |
|------|-----|
| JDBC URL | `jdbc:h2:file:./data/tracker` |
| 用户名 | `sa` |
| 密码 | （留空） |

---

## 💻 开发指南

### 后端开发

#### 目录约定

```
backend/src/main/java/com/project/tracker/
├── TrackerApplication.java       # Spring Boot 启动类
├── config/                       # 配置类
│   ├── WebConfig.java            # CORS + 拦截器注册
│   ├── MyBatisPlusConfig.java    # 分页插件 + MapperScan
│   ├── AsyncConfig.java          # 异步任务线程池
│   ├── GlobalExceptionHandler.java # 全局异常处理
│   ├── SpaWebFilter.java         # SPA 路由回退
│   └── DataInitializer.java      # 数据初始化
├── controller/                   # REST 控制器
├── dto/                          # 数据传输对象（VO、Request、Response）
├── entity/                       # 实体类（@TableName 映射数据库表）
├── exception/                    # 自定义异常
├── filter/                       # 过滤器
│   ├── AuthInterceptor.java      # 认证拦截器
│   └── AccessLogFilter.java      # 访问日志过滤器
├── mapper/                       # MyBatis Mapper 接口
└── service/                      # 业务服务接口
    └── impl/                     # 业务服务实现
```

#### 新增模块步骤

1. **建表** — 在 `schema-h2.sql` 中添加 `CREATE TABLE IF NOT EXISTS`
2. **种子数据** — 在 `data-h2.sql` 中添加 `MERGE INTO`
3. **Entity** — `entity/` 下创建 `@Data @TableName` 实体类
4. **Mapper** — `mapper/` 下创建 `@Mapper extends BaseMapper` 接口
5. **XML** (可选) — `resources/mapper/` 下创建复杂查询映射
6. **Service** — `service/` 创建接口，`service/impl/` 创建实现
7. **Controller** — `controller/` 创建 `@RestController`

#### 数据库切换

```bash
# 本地开发（H2 文件模式）
mvn spring-boot:run

# 切换 MySQL
mvn spring-boot:run -Dspring-boot.run.profiles=mysql
```

`application-mysql.yml` 配置：
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/project_tracker?useSSL=false&serverTimezone=Asia/Shanghai
    driver-class-name: com.mysql.cj.jdbc.Driver
    username: root
    password: ${MYSQL_PASSWORD:root}
```

### 前端开发

#### 工具注册机制（核心）

**新增页面模块对存量代码零改动**。只需三步：

**Step 1** — 创建模块目录和注册文件：

```
src/pages/my-module/
├── index.tsx          # 模块注册入口
└── MyPage.tsx         # 页面组件
```

**Step 2** — `index.tsx` 注册：

```tsx
import { lazy } from 'react';
import { AppstoreOutlined } from '@ant-design/icons';
import { registerTool } from '@/tools/registry';

registerTool({
  id: 'my-module',
  name: '我的模块',
  icon: <AppstoreOutlined />,
  group: '分组名称',
  routes: [
    {
      path: '/my-module',
      element: lazy(() => import('./MyPage')),
      title: '我的页面',
      showInMenu: true,   // true = 在左侧菜单显示
    },
  ],
});
```

**Step 3** — `App.tsx` 加一行导入：

```tsx
import './pages/my-module';
```

✅ 路由自动注册，左侧菜单自动出现，无需修改其他任何文件。

#### 目录约定

```
frontend/src/
├── main.tsx                     # 入口
├── App.tsx                      # 根组件
├── components/                  # 通用组件
│   ├── layout/MainLayout.tsx    # 主布局
│   └── ThemeSwitcher.tsx        # 主题切换器
├── context/                     # React Context
│   ├── ThemeContext.tsx          # 主题上下文
│   └── AuthContext.tsx           # 认证上下文
├── pages/                       # 页面（按模块组织）
│   ├── personnel/               # 人员管理
│   ├── role/                    # 角色管理
│   ├── oncall/                  # Oncall 排班
│   ├── version-track/           # 版本跟踪
│   ├── initiative-track/        # 专项跟踪
│   ├── dashboard/               # 项目看板
│   ├── system/                  # 系统管理
│   └── login/                   # 登录
├── router/index.tsx             # 动态路由 + 登录守卫
├── services/                    # API 封装（axios）
├── styles/global.css            # 全局样式
└── tools/                       # 注册机制
    ├── registry.ts              # 工具注册表
    └── types.ts                 # 类型定义
```

---

## 📡 API 文档

### 基础约定

- 统一响应格式：`{ code: 200, message: "success", data: T }`
- 分页响应：`{ code: 200, data: { records: [...], total: N, size: M, current: P } }`
- 错误响应：`{ code: 4xx/5xx, message: "...", data: null }`

### 认证接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/auth/captcha` | 获取验证码图片（base64） |
| POST | `/api/auth/login` | 登录 `{ employeeId, password, captcha, remember }` |
| POST | `/api/auth/logout` | 退出登录 |
| GET | `/api/auth/me` | 获取当前用户信息 |
| POST | `/api/auth/change-password` | 修改密码 |
| POST | `/api/auth/reset-password/{userId}` | 管理员重置用户密码 |

### 人员管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/personnel` | 分页列表（可选 `keyword`） |
| GET | `/api/personnel/all` | 全部人员 |
| GET | `/api/personnel/with-roles` | 全部人员（含角色信息） |
| POST | `/api/personnel` | 添加人员 |
| PUT | `/api/personnel/{id}` | 更新人员 |
| DELETE | `/api/personnel/{id}` | 删除人员 |
| GET | `/api/personnel/{id}/roles` | 获取人员角色 |
| PUT | `/api/personnel/{id}/roles` | 分配角色 `{ roleIds: [...] }` |
| GET | `/api/personnel/export/template` | 下载导入模板 |
| POST | `/api/personnel/import` | 导入人员（multipart） |

### 角色管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/roles` | 角色列表 |
| POST/PUT/DELETE | `/api/roles[/{id}]` | CRUD |

### 版本跟踪

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/versions` | 分页列表（可选 `keyword/sortBy/sortOrder/status`） |
| GET | `/api/versions/{id}` | 版本详情（含需求和阶段树） |
| POST | `/api/versions` | 创建版本 |
| PUT | `/api/versions/{id}` | 更新版本 |
| DELETE | `/api/versions/{id}` | 删除版本 |
| POST | `/api/versions/{id}/copy?newName=` | 复制版本 |
| GET | `/api/versions/export/template` | 下载导入模板 |
| POST | `/api/versions/import` | Excel 导入版本 |
| CRUD | `/api/versions/{id}/requirements/...` | 版本需求 CRUD |
| CRUD | `/api/versions/{id}/stages/...` | 阶段 CRUD |

### 专项跟踪

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/initiatives` | 分页列表（可选 `keyword`） |
| GET | `/api/initiatives/{id}` | 专项详情（含里程碑和风险） |
| POST/PUT/DELETE | `/api/initiatives[/{id}]` | CRUD |
| CRUD | `/api/initiatives/{id}/milestones/...` | 里程碑 CRUD |
| CRUD | `/api/initiatives/{id}/milestones/{msId}/risks/...` | 风险 CRUD |

### 项目看板

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/dashboard/events?year=&month=` | 获取看板事件（`month` 可选，不传返回全年） |

### 备份管理

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/system/backup` | 手动触发异步备份 |
| GET | `/api/system/backup/progress/{taskId}` | 备份进度 |
| GET | `/api/system/backups` | 备份文件列表 |
| GET | `/api/system/backups/download/{name}` | 下载备份文件 |
| POST | `/api/system/backups/{name}/restore` | 异步恢复备份 |
| GET | `/api/system/restore/progress/{taskId}` | 恢复进度 |

### 访问记录

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/system/access-logs` | 分页访问记录 |
| DELETE | `/api/system/access-logs/clean` | 清理一周前记录 |

---

## 🗄 数据库设计

### ER 概要

```
personnel ──┬── personnel_role ──── sys_role
             │
             ├── monthly_oncall
             │
version ─────┬── version_requirement
             │
             └── version_stage ── stage_check_item

initiative ──┬── initiative_milestone ── initiative_risk

access_log (独立，不参与备份)
```

### 表清单

| 表名 | 主键 | 说明 | 关键字段 |
|------|------|------|---------|
| `personnel` | id | 人员 | employee_id, name, email, password (PBKDF2), remember_token, first_login |
| `sys_role` | id | 系统角色 | code (UNIQUE), name, description |
| `personnel_role` | id | 人员-角色关联 | personnel_id, role_id |
| `monthly_oncall` | id | 月度 Oncall | year_month (UNIQUE), oncall_person_id, backup_person_id |
| `version` | id | 版本 | name, status, owner, planned_date, actual_date |
| `version_requirement` | id | 版本需求 | version_id, name, req_number, assignee |
| `version_stage` | id | 版本阶段（树形） | version_id, parent_id, name, due_date, status, assignee |
| `stage_check_item` | id | 阶段检查项 | stage_id, name, status, assignee |
| `initiative` | id | 专项 | name, status, owner, start_date, end_date |
| `initiative_milestone` | id | 里程碑 | initiative_id, name, target_date, actual_date, status |
| `initiative_risk` | id | 风险 | initiative_id, milestone_id, title, severity, status, owner, resolution_date |
| `access_log` | id | 访问日志 | username, ip, method, path, user_agent, create_time |

> 所有外键已移除以简化备份恢复和扩展，表间通过 ID 字段逻辑关联。

---

## 🚢 部署运维

### 一体化打包

前端构建产物集成到 Spring Boot JAR 中，部署只需一个文件：

```bash
# 1. 构建前端
cd frontend && npm run build

# 2. 构建后端（前端产物自动包含）
cd ../backend && mvn clean package -DskipTests

# 3. 部署（服务器只需 JRE 17+）
java -jar target/project-tracker.jar --spring.profiles.active=mysql
```

### 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `MYSQL_PASSWORD` | `root` | MySQL 密码（`application-mysql.yml` 引用） |
| `SERVER_PORT` | `8080` | 服务端口 |

### 备份策略

| 类型 | 频率 | 目录 | 保留 |
|------|------|------|------|
| 自动 | 每天 0:00 / 12:00 | `./backup/` | 30 天 |
| 手动 | 按需 | `./backup/` | 30 天 |

### 日志

Spring Boot 默认输出到控制台，可配置 `application.yml`：

```yaml
logging:
  file:
    path: ./logs
  level:
    com.project.tracker: INFO
```

---

## 🔐 系统安全

| 层面 | 措施 |
|------|------|
| 密码存储 | PBKDF2WithHmacSHA256（10000 次迭代，16 字节随机盐），换环境可验证 |
| 会话管理 | HttpSession + Cookie（7 天免登录 Token） |
| 接口鉴权 | AuthInterceptor 全局拦截，游客仅 GET |
| SQL 注入 | MyBatis-Plus 参数化查询 + `#{}` 占位符 |
| XSS | React 默认转义，无需额外处理 |
| 验证码 | 图形验证码，Session 存储，登录即销毁 |
| 暴力破解 | 验证码机制增加攻击成本 |

---

## 🎨 主题系统

通过右上角 🎨 调色板图标切换主题，支持 9 种预设风格：

| 主题 | 主色调 | 圆角 | 侧边栏 | 特色 |
|------|--------|------|--------|------|
| **默认** | `#2563eb` | 10px | 毛玻璃 | 清爽专业 |
| **暗黑** | `#3b82f6` | 10px | 纯黑 | 深色沉浸 |
| **MUI** | `#1976d2` | 4px | 毛玻璃 | Material Design 锐利 |
| **可爱** | `#ec4899` | 20px | 粉色毛玻璃 | 圆润少女风 |
| **插画** | `#52C41A` | 12px | 纯色黄底 | 3px 粗黑边框 + 硬阴影 |
| **极简** | `#374151` | 6px | 毛玻璃 | 大量留白 |
| **活力** | `#f43f5e` | 12px | 毛玻璃 | 大胆红色 |
| **海洋** | `#0891b2` | 10px | 毛玻璃 | 清凉冷静 |
| **自然** | `#16a34a` | 8px | 毛玻璃 | 绿色舒适 |

主题基于 Ant Design 5 的 `ConfigProvider` + 组件级 `styles/classNames` 覆盖实现，支持 `components` 级别的深度定制。

---

## 📁 项目结构

```
project-tracker/
├── README.md
├── backend/                           # Spring Boot 后端
│   ├── pom.xml                        # Maven 配置
│   ├── data/                          # H2 数据库文件（gitignore）
│   ├── backup/                        # 备份文件目录（gitignore）
│   └── src/main/
│       ├── java/com/project/tracker/
│       │   ├── TrackerApplication.java
│       │   ├── config/                # 配置
│       │   │   ├── WebConfig.java
│       │   │   ├── MyBatisPlusConfig.java
│       │   │   ├── AsyncConfig.java
│       │   │   ├── GlobalExceptionHandler.java
│       │   │   ├── SpaWebFilter.java
│       │   │   └── DataInitializer.java
│       │   ├── controller/            # 控制器（18 个）
│       │   ├── dto/                   # 数据传输对象
│       │   ├── entity/                # 实体类（12 个）
│       │   ├── exception/             # 异常类
│       │   ├── filter/                # 过滤器
│       │   │   ├── AccessLogFilter.java
│       │   │   └── AuthInterceptor.java
│       │   ├── mapper/                # Mapper 接口（12 个）
│       │   └── service/               # 服务层
│       │       ├── impl/              # 服务实现
│       │       ├── AuthService.java
│       │       ├── BackupService.java
│       │       ├── BackupScheduler.java
│       │       ├── PasswordUtil.java
│       │       └── StageTreeBuilder.java
│       └── resources/
│           ├── application.yml
│           ├── application-local.yml
│           ├── application-mysql.yml
│           ├── schema-h2.sql
│           ├── data-h2.sql
│           ├── mapper/                # MyBatis XML 映射（4 个）
│           └── static/                # 前端构建产物（gitignore）
└── frontend/                          # React 前端
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── vite-env.d.ts
        ├── components/                # 通用组件
        │   ├── layout/MainLayout.tsx
        │   └── ThemeSwitcher.tsx
        ├── context/                   # 上下文
        │   ├── AuthContext.tsx
        │   └── ThemeContext.tsx
        ├── pages/                     # 页面模块（8 个）
        ├── router/index.tsx           # 路由
        ├── services/                  # API 封装（8 个）
        ├── styles/global.css          # 全局样式
        └── tools/                     # 工具注册机制
            ├── registry.ts
            └── types.ts
```

---

## 🤝 贡献指南

### 提交规范

推荐使用 [Conventional Commits](https://www.conventionalcommits.org/)：

```
feat: 新增版本复制功能
fix: 修复阶段勾选级联不完整
docs: 更新 README 部署说明
refactor: 重构备份服务为通用 JDBC
style: 优化登录页渐变背景
```

### Pull Request 流程

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feat/my-feature`
3. 提交代码：`git commit -m 'feat: 描述'`
4. 推送分支：`git push origin feat/my-feature`
5. 提交 Pull Request

### 代码规范

- 后端遵循 [Google Java Style](https://google.github.io/styleguide/javaguide.html)
- 前端遵循 ESLint + Prettier 默认配置
- 新增页面务必使用工具注册机制（`registerTool`）

---

## ❓ FAQ

**Q: 为什么移除了所有外键约束？**

A: 解耦后备份恢复无需按依赖顺序操作，任意表可独立读写。新增表也更灵活，不受外键顺序限制。表间关联通过 ID 字段的逻辑关系维护，JOIN 查询不受影响。

**Q: 如何从 H2 迁移到 MySQL？**

A: 修改 `application-*.yml` 切换数据源，然后通过备份（JSON）在 H2 上导出 → MySQL 上恢复。备份格式是标准 JSON，不依赖数据库。

**Q: 服务器只有 JRE 能部署吗？**

A: 可以。`mvn package` 生成的 JAR 已包含嵌入式 Tomcat + 前端静态资源，只需 `java -jar tracker.jar`。

**Q: 备份的 JSON 文件可以直接查看吗？**

A: 可以。备份文件是标准 JSON 格式，`tables` 下每张表是一个数组，每条记录是 key-value 对象。

**Q: 游客账户权限如何控制？**

A: 后端 `AuthInterceptor` 检测 GUEST 角色，对非 GET 请求返回 403。前端 `guestProps(isGuest)` 函数统一处理按钮 `disabled` 和 `title` 提示。

---

## 📝 更新日志

### v1.0.0 (2026-05)

- 人员与角色管理
- 版本跟踪（树形阶段 + 级联勾选 + 时间校验）
- 专项跟踪（里程碑内嵌风险）
- Oncall 排班
- 项目看板（年/月视图）
- 备份管理（JSON 通用 + 定时 + 恢复）
- 访问记录（自动记录 + 清理）
- 登录系统（PBKDF2 + 验证码 + 7 天免登录）
- 游客模式（仅查询，按钮置灰）
- 9 种预设主题 + 用户自选
- Excel 导入导出（人员 / 版本）
- 工具注册机制（前端模块化）

---

## 👤 作者

**lzwanan**

- 📧 Email: [lzwanan@outlook.com](mailto:lzwanan@outlook.com)
- 🐙 GitHub: [@lzwanan](https://github.com/lzwanan)

---

## 📄 License

本项目基于 [MIT License](https://opensource.org/licenses/MIT) 开源。

```
MIT License

Copyright (c) 2026 lzwanan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
