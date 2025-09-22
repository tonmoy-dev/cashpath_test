-- Create user settings table
create table if not exists public.user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  current_business_id uuid references public.businesses(id) on delete set null,
  onboarding_completed boolean default false,
  theme text default 'light' check (theme in ('light', 'dark', 'system')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- Enable Row Level Security
alter table public.user_settings enable row level security;

-- Create policies for user_settings table
create policy "user_settings_select_own"
  on public.user_settings for select
  using (auth.uid() = user_id);

create policy "user_settings_insert_own"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

create policy "user_settings_update_own"
  on public.user_settings for update
  using (auth.uid() = user_id);

create policy "user_settings_delete_own"
  on public.user_settings for delete
  using (auth.uid() = user_id);
