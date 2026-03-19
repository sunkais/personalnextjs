# 像素舱 — 四人学习分享网站

四位同学的学习作品展示空间，支持游戏、应用、学习笔记的分享，访客可浏览、评论、点赞、收藏。

## 技术栈

- **前端**: Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **后端**: Supabase (PostgreSQL + Auth + Storage)

## 快速开始

### 1. 创建 Supabase 项目

1. 前往 [supabase.com](https://supabase.com) 创建项目
2. 在 SQL Editor 中执行 `supabase/migrations/001_initial_schema.sql` 和 `002_storage_bucket.sql`
3. 在 Authentication → URL Configuration 中设置 Site URL 和 Redirect URLs（如 `http://localhost:3000` 和 `http://localhost:3000/auth/callback`）

### 2. 配置环境变量

```bash
cd web
cp .env.example .env.local
# 编辑 .env.local，填入 Supabase URL 和 anon key
```

### 3. 创建四位创作者

1. 四位同学分别注册账号（/register）
2. 在 Supabase Dashboard → SQL Editor 中执行：

```sql
-- 为每位创作者创建 member 记录（将 auth_user_id 替换为 auth.users 中的 id）
INSERT INTO members (auth_user_id, name, bio) VALUES
  ('用户1的uuid', '小明', '游戏爱好者'),
  ('用户2的uuid', '小红', '前端开发'),
  ('用户3的uuid', '小刚', 'Python 玩家'),
  ('用户4的uuid', '小美', '笔记达人');
```

### 4. 运行开发服务器

```bash
cd web
npm install
npm run dev
```

访问 http://localhost:3000

## 项目结构

```
├── web/                 # Next.js 应用
│   └── src/
│       ├── app/         # 页面与路由
│       ├── components/  # 公共组件
│       ├── lib/         # Supabase 客户端
│       └── types/       # 类型定义
├── supabase/
│   └── migrations/      # 数据库迁移
└── docs/                # 设计文档
```

## 部署到 Vercel

1. 将项目推送到 GitHub
2. 在 Vercel 中导入项目，选择 `web` 目录为根目录
3. 配置环境变量 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. 在 Supabase 的 Redirect URLs 中添加 Vercel 部署域名
