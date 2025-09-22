-- Create team_members table for invitations and team management
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  email text not null,
  role text check (role in ('partner', 'staff')) not null,
  status text check (status in ('pending', 'active', 'inactive')) default 'pending',
  invitation_code text unique,
  invited_by uuid references public.profiles(id) on delete set null,
  invited_at timestamp with time zone default timezone('utc'::text, now()) not null,
  joined_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.team_members enable row level security;

-- Create policies for team_members
create policy "team_members_select_business"
  on public.team_members for select
  using (
    business_id in (
      select id from public.businesses where owner_id = auth.uid()
    )
  );

create policy "team_members_insert_business"
  on public.team_members for insert
  with check (
    business_id in (
      select id from public.businesses where owner_id = auth.uid()
    )
  );

create policy "team_members_update_business"
  on public.team_members for update
  using (
    business_id in (
      select id from public.businesses where owner_id = auth.uid()
    )
  );

create policy "team_members_delete_business"
  on public.team_members for delete
  using (
    business_id in (
      select id from public.businesses where owner_id = auth.uid()
    )
  );
