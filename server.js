require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---- Supabase 客户端（环境变量优先，内置默认配置兜底） ----
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://rcxjvsgqghjqalqceyca.supabase.co';
const SUPABASE_KEY =
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjeGp2c2dxZ2hqcWFscWNleWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5MTcwNjQsImV4cCI6MjEwODQ5MzA2NH0.Pd0TKuQ8f1LAUI9FZGtYzfIcpyXZH8xtjn8eZHRpIEw';
let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('✓ 已连接 Supabase 数据库');
} else {
  console.log('! 未配置 Supabase，使用内存存储（重启后数据丢失）');
}

// 内存降级存储
let memId = 1;
const memTasks = [];

app.get('/api/tasks', async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.json({ mode: 'supabase', data });
    }
    return res.json({ mode: 'memory', data: [...memTasks].sort((a, b) => b.created_at.localeCompare(a.created_at)) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  const { title, priority } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ error: '任务标题不能为空' });
  const p = ['high', 'medium', 'low'].includes(priority) ? priority : 'medium';
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('tasks')
        .insert({ title: title.trim(), priority: p })
        .select()
        .single();
      if (error) throw error;
      return res.json({ data });
    }
    const t = { id: memId++, title: title.trim(), priority: p, done: false, created_at: new Date().toISOString() };
    memTasks.push(t);
    return res.json({ data: t });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch('/api/tasks/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { done, title, priority } = req.body;
  const patch = {};
  if (typeof done === 'boolean') patch.done = done;
  if (title !== undefined) patch.title = title.trim();
  if (['high', 'medium', 'low'].includes(priority)) patch.priority = priority;
  try {
    if (supabase) {
      const { data, error } = await supabase.from('tasks').update(patch).eq('id', id).select().single();
      if (error) throw error;
      return res.json({ data });
    }
    const t = memTasks.find((t) => t.id === id);
    if (!t) return res.status(404).json({ error: '任务不存在' });
    Object.assign(t, patch);
    return res.json({ data: t });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    if (supabase) {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
      return res.json({ ok: true });
    }
    const i = memTasks.findIndex((t) => t.id === id);
    if (i > -1) memTasks.splice(i, 1);
    return res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 本地运行时启动监听；Vercel Serverless 环境下导出 app
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`✓ 任务管理系统已启动: http://localhost:${PORT}`));
}

module.exports = app;
