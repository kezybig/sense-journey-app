# SenseJourney Backend

后端服务为 SenseJourney（逃生舱）应用程序提供支持，使用 Go、Gin 和 GORM 构建。

## 项目概述

SenseJourney 是一款专为高压都市人群设计的"盲盒式周末免决策逃跑服务"。后端提供用户认证、旅程选择管理和数据存储功能。

## 核心技术栈

- **语言**: Go 1.25+
- **Web框架**: Gin
- **ORM**: GORM
- **数据库**: MySQL 5.7+ (主用)，SQLite (备用)
- **ID系统**: Snowflake-like 算法 + Hashids 编码

## 先决条件

- Go 1.25.0 或更高版本
- MySQL 5.7 或更高版本 (推荐)

## 快速开始

### 1. 克隆仓库

```bash
git clone <repository-url>
cd sensejourney/backend
```

### 2. 安装依赖

```bash
go mod tidy
```

### 3. 配置数据库

#### MySQL 配置 (推荐)
```bash
# 创建数据库
mysql -u root -p -e "CREATE DATABASE sensejourney;"

# 默认连接配置 (可修改 config/database.go)
# 用户名: root
# 密码: password
# 数据库: sensejourney
```

#### 使用环境变量 (可选)
```bash
# 设置自定义 MySQL 连接字符串
export MYSQL_DSN="username:password@tcp(host:port)/sensejourney?charset=utf8mb4&parseTime=True&loc=Local"
```

### 4. 启动服务器

```bash
go run main.go
```

服务器将在 `http://localhost:8080` 启动。

## UID 系统说明

### 设计理念
- 使用 Snowflake-like 算法生成 uint64 数字 ID
- 通过 Hashids 编码为短字符串在前端使用
- 实现数据库存储效率和前端用户体验的平衡

### 算法组成
- **41位时间戳**: 从 2024-01-01 开始的 5 分钟时间块
- **12位机器ID**: 支持最多 4095 个实例
- **11位序列号**: 每 5 分钟块支持最多 2047 个序列

### 编解码示例
```go
// 生成 UID
uid := utils.GenerateUID() // uint64 数字

// 编码为 Hashid
hashid := utils.EncodeUIDToHashid(uid) // 例如: "RrdHpN7ZQE"

// 解码为 UID
decodedUID := utils.DecodeHashidToUID(hashid) // uint64 数字
```

## 数据库配置

### 默认配置
- **主数据库**: MySQL (`root:password@tcp(localhost:3306)/sensejourney`)
- **备用数据库**: SQLite (当 MySQL 连接失败时自动回退)
- **ORM 配置**: 禁用外键约束迁移 (避免迁移时依赖问题)

### 数据模型

#### User 模型
```go
type User struct {
    ID        uint      `gorm:"primaryKey;autoIncrement"`
    Phone     string    `gorm:"uniqueIndex;size:20"`
    Email     string    `gorm:"uniqueIndex;size:100"`
    Password  string    `gorm:"size:100"`
    UID       uint64    `gorm:"uniqueIndex"` // 数字 UID
    CreatedAt time.Time
    UpdatedAt time.Time
}
```

#### JourneySelection 模型
```go
type JourneySelection struct {
    ID        uint      `gorm:"primaryKey;autoIncrement"`
    UID       uint64    `gorm:"index;not null"` // 关联用户 UID
    Budget    string    `gorm:"size:20;not null"`
    Duration  string    `gorm:"size:20;not null"`
    Proximity string    `gorm:"size:20;not null"`
    Transport string    `gorm:"size:50;not null"`
    Moods     datatypes.JSON
    CreatedAt time.Time
    UpdatedAt time.Time
}
```

## API 端点

### 用户认证

#### POST /api/login
- **描述**: 使用手机号和密码登录
- **请求体**:
```json
{
  "phone": "13800138000",
  "password": "your_password"
}
```
- **响应**:
```json
{
  "message": "Login successful",
  "user": {
    "id": "RrdHpN7ZQE",  // Hashid 编码的用户ID
    "phone": "13800138000",
    "email": "user@example.com"
  }
}
```

#### POST /api/register
- **描述**: 注册新用户
- **请求体**:
```json
{
  "phone": "13800138000",
  "email": "user@example.com",
  "password": "your_password"
}
```
- **响应**:
```json
{
  "message": "Registration successful",
  "user": {
    "id": "RrdHpN7ZQE",
    "phone": "13800138000",
    "email": "user@example.com"
  }
}
```

#### GET /api/user/:phone
- **描述**: 通过手机号获取用户信息
- **响应**:
```json
{
  "user": {
    "id": "RrdHpN7ZQE",
    "phone": "13800138000",
    "email": "user@example.com"
  }
}
```

### 旅程选择管理

#### POST /api/journey-selections
- **描述**: 创建新的旅程选择
- **请求体**:
```json
{
  "uid": "RrdHpN7ZQE",
  "budget": "1500",
  "duration": "1-2",
  "proximity": "1-3H",
  "transport": "公共交通",
  "moods": ["安静独处", "人文探访"]
}
```
- **响应**:
```json
{
  "message": "Journey selection created successfully",
  "selection": {
    "id": 1,
    "uid": "RrdHpN7ZQE",
    "budget": "1500",
    "duration": "1-2",
    "proximity": "1-3H",
    "transport": "公共交通",
    "moods": ["安静独处", "人文探访"],
    "created_at": "2026-04-14T17:53:56.194+08:00"
  }
}
```

#### GET /api/journey-selections/user/:uid
- **描述**: 获取指定用户的所有旅程选择
- **响应**:
```json
{
  "selections": [
    {
      "id": 1,
      "uid": "RrdHpN7ZQE",
      "budget": "1500",
      "duration": "1-2",
      "proximity": "1-3H",
      "transport": "公共交通",
      "moods": ["安静独处", "人文探访"],
      "created_at": "2026-04-14T17:53:56.194+08:00"
    }
  ]
}
```

#### GET /api/journey-selections/latest/:uid
- **描述**: 获取指定用户的最新旅程选择
- **响应**:
```json
{
  "selection": {
    "id": 1,
    "uid": "RrdHpN7ZQE",
    "budget": "1500",
    "duration": "1-2",
    "proximity": "1-3H",
    "transport": "公共交通",
    "moods": ["安静独处", "人文探访"],
    "created_at": "2026-04-14T17:53:56.194+08:00"
  }
}
```

#### DELETE /api/journey-selections/:id
- **描述**: 删除指定的旅程选择
- **响应**:
```json
{
  "message": "Journey selection deleted successfully"
}
```

## 项目结构

```
backend/
├── api/
│   └── handlers.go          # 所有API处理器
├── config/
│   └── database.go          # 数据库配置和连接
├── models/
│   ├── user.go              # 用户模型
│   └── journey_selection.go # 旅程选择模型
├── utils/
│   ├── uid.go               # UID生成算法
│   └── hashids.go           # Hashids编解码工具
├── web-build/               # 前端静态文件构建
├── main.go                  # 主应用程序入口
├── go.mod                   # Go模块文件
├── go.sum                   # 依赖校验
└── README.md                # 本文档
```

## 功能特性

- ✅ 用户注册和登录 (手机号/邮箱)
- ✅ 密码加密 (bcrypt)
- ✅ Snowflake-like UID 生成系统
- ✅ Hashids 编码/解码
- ✅ MySQL 数据库支持 (自动回退到 SQLite)
- ✅ 旅程选择管理 (CRUD)
- ✅ JSON 格式的情绪数组存储
- ✅ 跨域资源共享 (CORS) 支持
- ✅ 数据库自动迁移
- 🔄 JWT 令牌生成 (待实现)
- 🔄 邮件/短信验证 (待实现)

## 测试

### 运行服务器测试

```bash
# 启动服务器
go run main.go

# 测试注册接口
curl -X POST http://localhost:8080/api/register \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","email":"test@example.com","password":"test123456"}'

# 测试登录接口
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","password":"test123456"}'

# 测试旅程选择创建
curl -X POST http://localhost:8080/api/journey-selections \
  -H "Content-Type: application/json" \
  -d '{"uid":"RrdHpN7ZQE","budget":"1500","duration":"1-2","proximity":"1-3H","transport":"公共交通","moods":["安静独处","人文探访"]}'
```

### 数据库验证

```bash
# 查看用户表
mysql -u root -ppassword sensejourney -e "SELECT id, uid, phone, email FROM users;"

# 查看旅程选择表
mysql -u root -ppassword sensejourney -e "SELECT id, uid, budget, duration, moods FROM journey_selections;"
```

## 开发说明

### 环境变量

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| MYSQL_DSN | MySQL 连接字符串 | root:password@tcp(localhost:3306)/sensejourney |
| PORT | 服务器端口 | 8080 |

### 代码风格

- 遵循 Go 官方代码规范
- 使用 Go modules 管理依赖
- 错误处理使用 `if err != nil` 模式
- 日志使用标准库 `log` 包

### 贡献指南

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

[MIT License](LICENSE)

## 支持与联系方式

如有问题或建议，请提交 Issue 或联系开发团队。

---

**最后更新**: 2026-04-14  
**文档版本**: V2.0  
**更新内容**: 添加 UID 系统说明、MySQL 配置、完整 API 文档