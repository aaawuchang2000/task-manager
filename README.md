# 智能任务管理系统（Node.js + Supabase）

## 功能
- 添加任务：输入框 + 优先级下拉（高/中/低）
- 任务列表：标题、优先级徽章、创建时间，按创建时间倒序
- 每条任务支持"完成/未完成"切换（完成后加删除线）和"删除"
- 按优先级筛选：全部 / 高 / 中 / 低
- 中文界面，简洁美观

## 快速开始
```bash
npm install
npm start          # 未配置 Supabase 时自动使用内存存储
# 打开 http://localhost:3000
```

## 接入 Supabase（持久化存储）
1. 在 [supabase.com](https://supabase.com) 创建项目
2. 在 SQL Editor 中执行 `schema.sql`
3. 复制 `.env.example` 为 `.env`，填入 SUPABASE_URL 和 SUPABASE_ANON_KEY
4. 重启 `npm start`，页面底部会显示"数据存储：Supabase 数据库"

## API
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/tasks | 任务列表（倒序） |
| POST | /api/tasks | 添加任务 {title, priority} |
| PATCH | /api/tasks/:id | 更新任务 {done/title/priority} |
| DELETE | /api/tasks/:id | 删除任务 |
