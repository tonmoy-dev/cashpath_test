-- Create businesses table
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text,
  owner_id uuid references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_active boolean default true
);

-- Enable RLS
alter table public.businesses enable row level security;

-- Create policies for businesses
create policy "businesses_select_own"
  on public.businesses for select
  using (auth.uid() = owner_id);

create policy "businesses_insert_own"
  on public.businesses for insert
  with check (auth.uid() = owner_id);

create policy "businesses_update_own"
  on public.businesses for update
  using (auth.uid() = owner_id);

create policy "businesses_delete_own"
  on public.businesses for delete
  using (auth.uid() = owner_id);
