-- Create team members table
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  member_name text not null,
  email text,
  role text not null check (role in ('owner', 'admin', 'accountant', 'viewer')),
  permissions jsonb default '{}',
  status text not null check (status in ('active', 'inactive', 'pending')) default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.team_members enable row level security;

-- Create policies for team members
create policy "team_members_select_own"
  on public.team_members for select
  using (auth.uid() = user_id);

create policy "team_members_insert_own"
  on public.team_members for insert
  with check (auth.uid() = user_id);

create policy "team_members_update_own"
  on public.team_members for update
  using (auth.uid() = user_id);

create policy "team_members_delete_own"
  on public.team_members for delete
  using (auth.uid() = user_id);

-- Create indexes
create index if not exists team_members_user_id_idx on public.team_members(user_id);
create index if not exists team_members_business_id_idx on public.team_members(business_id);
