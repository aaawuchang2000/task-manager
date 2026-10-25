-- 在 Supabase 控制台 → SQL Editor 中执行以下语句即可
create table if not exists tasks (
  id bigint generated always as identity primary key,
  title text not null,
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  done boolean not null default false,
  created_at timestamptz not null default now()
);

-- 启用行级安全并允许匿名读写（演示用途，生产环境请按需收紧）
alter table tasks enable row level security;

create policy "允许匿名读取" on tasks for select using (true);
create policy "允许匿名插入" on tasks for insert with check (true);
create policy "允许匿名更新" on tasks for update using (true);
create policy "允许匿名删除" on tasks for delete using (true);
