# 四人学习分享网站 — 设计规格

**日期**：2025-03-18  
**状态**：已通过设计评审

---

## 1. 项目概述

四人学习分享网站，供四位同学各自展示作品（游戏、应用、学习笔记等），访客可浏览、评论、点赞、收藏。完全公开访问，风格活泼有趣、色彩丰富、有动效，偏创意/游戏感。

### 1.1 设计共识

| 维度 | 选择 |
|------|------|
| 定位 | 个人展示空间，每人一块地盘 |
| 访问 | 完全公开 |
| 内容 | 文件上传 + 链接/嵌入 |
| 互动 | 评论 + 点赞/收藏 |
| 风格 | 活泼有趣、色彩丰富、有动效 |
| 名字方向 | 创意/游戏感（如创玩、像素舱、代码舱） |
| 技术方案 | 混合方案（静态 + Serverless + Supabase） |

### 1.2 角色

- **创作者（4 人）**：登录后可上传、管理自己的作品
- **访客**：可浏览全部内容
- **注册访客**：可评论、点赞、收藏

---

## 2. 架构与技术选型

| 层级 | 选型 | 说明 |
|------|------|------|
| 前端 | Next.js (App Router) | 静态页面 + API Routes |
| 数据库 | Supabase | PostgreSQL + Auth + Storage |
| 文件存储 | Supabase Storage | 笔记、文档、图片等上传 |
| Serverless | Vercel Functions | 评论、点赞、收藏等 API |
| 部署 | Vercel | 前端 + API 一体化 |

**数据流**：静态页面从 Supabase 读取内容；评论、点赞、收藏经 API 写入 Supabase；文件上传至 Storage，元数据写入数据库。

---

## 3. 页面结构与导航

```
首页 (/)
├── 四人入口卡片
├── 最新动态（可选）
└── 网站名称 + 简短介绍

成员空间 (/member/[id])
├── 成员头像、昵称、简介
├── 作品列表（卡片式，筛选：全部/游戏/应用/笔记）
└── 作品卡片：封面、标题、类型、点赞数、评论数

作品详情 (/member/[id]/work/[workId])
├── 作品标题、类型、描述、上传时间
├── 内容展示区
│   ├── 文件：PDF 预览 / 图片展示 / 文档下载
│   └── 链接：iframe 嵌入（itch.io、CodePen 等）或跳转链接
├── 点赞、收藏按钮
└── 评论列表 + 评论输入框（需登录）

其他
├── /login、/register
└── /profile — 个人资料、我的收藏
```

**导航**：顶部 Logo + 四人快捷入口 + 登录/注册；移动端汉堡菜单。

---

## 4. 核心功能与数据模型

### 4.1 内容类型与上传

| 类型 | 上传方式 | 展示方式 |
|------|----------|----------|
| 文件 | 上传至 Supabase Storage | PDF 内嵌预览 / 图片展示 / 其他格式下载 |
| 链接 | 填写 URL + 平台类型 | itch.io、CodePen 等 iframe 嵌入；其他为新标签页链接 |

**上传流程**：登录 → 进入自己的空间 → 添加作品 → 选择类型 → 填写信息 → 提交。

### 4.2 互动功能

- **点赞**：每用户每作品限 1 次，可取消
- **收藏**：每用户可收藏多作品，在 `/profile` 查看
- **评论**：支持多级回复（MVP 可先做单层）

### 4.3 数据模型

```
members
  id, auth_user_id（关联 auth.users.id）, name, avatar_url, bio, created_at

works
  id, member_id, title, type(文件|链接),
  file_url | embed_url, description, cover_image, created_at

likes
  user_id, work_id（联合唯一）

favorites
  user_id, work_id（联合唯一）

comments
  id, work_id, user_id, content, parent_id(可选), created_at
```

用户表使用 Supabase Auth 的 `auth.users`。`members.auth_user_id` 在初始部署时通过手动插入或迁移脚本设置，将 4 位创作者的 auth 账号与 4 条 member 记录一一对应。

### 4.4 链接平台支持

- **iframe 嵌入**：itch.io、CodePen、CodeSandbox 等，根据 URL 自动识别并嵌入
- **其他链接**：无法嵌入的 URL 显示为「在新标签页打开」按钮

### 4.5 Python 游戏支持

Python 游戏打包后上传至 itch.io、GitHub Releases 等，在网站上以链接/嵌入方式展示；支持 itch.io iframe 嵌入。

---

## 5. 错误处理与边界情况

| 场景 | 处理方式 |
|------|----------|
| 未登录访问需登录功能 | 跳转登录页，登录后返回 |
| 文件上传失败 | 提示重试，保留表单 |
| 链接无效或无法嵌入 | 降级为普通链接 |
| 评论/点赞接口失败 | 提示「操作失败，请稍后重试」 |
| 作品不存在 | 404 页面，提供返回链接 |

---

## 6. 部署与安全

### 6.1 部署流程

1. Supabase：创建项目，配置 Storage、Auth、数据库表
2. Vercel：连接 Git，配置 Supabase 环境变量
3. 创作者：4 位创作者通过注册流程在 Supabase Auth 中创建账号；管理员在数据库中手动插入 `members` 记录并填写 `auth_user_id`，完成创作者与成员空间的绑定。MVP 阶段无管理后台，通过 SQL 或 Supabase Dashboard 操作。

### 6.2 权限

- 仅 4 位创作者可上传、编辑、删除自己的作品
- 通过 `members.auth_user_id` 关联 `auth.users`，并结合 `works.member_id` 控制权限；RLS 策略将基于此映射校验创作者身份
- Storage RLS：创作者可写自己空间，所有人可读

---

## 7. 后续迭代

- 多级评论
- 作品分类/标签
- 搜索
- 数据统计（浏览量等）
