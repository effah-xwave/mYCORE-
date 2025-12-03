# Supabase Database Setup

To make the app work, run the following SQL commands in your Supabase Project > SQL Editor.

```sql
-- 1. Create Users Table (Profile)
create table public.users (
  id uuid references auth.users not null primary key,
  email text,
  name text,
  onboarded boolean default false,
  interests jsonb default '[]'::jsonb,
  settings jsonb default '{"locationEnabled": false, "notificationsEnabled": false, "screenTimeEnabled": false}'::jsonb
);

-- 2. Create Habits Table
create table public.habits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  icon text,
  interest text,
  schedule text,
  trigger_type text,
  trigger_config jsonb,
  streak integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Create Habit Instances Table
create table public.habit_instances (
  id uuid default gen_random_uuid() primary key,
  habit_id uuid references public.habits(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  date text not null, -- YYYY-MM-DD
  completed boolean default false,
  completed_at timestamp with time zone,
  value integer,
  unique(habit_id, date)
);

-- 4. Create Projects Table
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  description text,
  start_date text,
  end_date text,
  progress integer default 0,
  status text default 'active'
);

-- 5. Create Tasks Table
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  description text,
  due_date text,
  priority text,
  category text,
  project_id uuid references public.projects(id) on delete set null,
  completed boolean default false,
  reminder jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. Enable Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.habits enable row level security;
alter table public.habit_instances enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;

-- 7. Create Policies (Allow users to see only their own data)

-- Users
create policy "Users can view their own profile" on public.users for select using (auth.uid() = id);
create policy "Users can insert their own profile" on public.users for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on public.users for update using (auth.uid() = id);

-- Habits
create policy "Users can view own habits" on public.habits for select using (auth.uid() = user_id);
create policy "Users can insert own habits" on public.habits for insert with check (auth.uid() = user_id);
create policy "Users can update own habits" on public.habits for update using (auth.uid() = user_id);
create policy "Users can delete own habits" on public.habits for delete using (auth.uid() = user_id);

-- Instances
create policy "Users can view own instances" on public.habit_instances for select using (auth.uid() = user_id);
create policy "Users can insert own instances" on public.habit_instances for insert with check (auth.uid() = user_id);
create policy "Users can update own instances" on public.habit_instances for update using (auth.uid() = user_id);

-- Projects
create policy "Users can view own projects" on public.projects for select using (auth.uid() = user_id);
create policy "Users can insert own projects" on public.projects for insert with check (auth.uid() = user_id);
create policy "Users can update own projects" on public.projects for update using (auth.uid() = user_id);
create policy "Users can delete own projects" on public.projects for delete using (auth.uid() = user_id);

-- Tasks
create policy "Users can view own tasks" on public.tasks for select using (auth.uid() = user_id);
create policy "Users can insert own tasks" on public.tasks for insert with check (auth.uid() = user_id);
create policy "Users can update own tasks" on public.tasks for update using (auth.uid() = user_id);
create policy "Users can delete own tasks" on public.tasks for delete using (auth.uid() = user_id);
```
