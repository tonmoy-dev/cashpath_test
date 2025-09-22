-- Create accounts table
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null default 'Cash',
  business_id uuid references public.businesses(id) on delete cascade,
  balance decimal(15,2) default 0,
  currency text default 'BDT',
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.accounts enable row level security;

-- Create policies for accounts (users can access accounts of their businesses)
create policy "accounts_select_business"
  on public.accounts for select
  using (
    business_id in (
      select id from public.businesses where owner_id = auth.uid()
    )
  );

create policy "accounts_insert_business"
  on public.accounts for insert
  with check (
    business_id in (
      select id from public.businesses where owner_id = auth.uid()
    )
  );

create policy "accounts_update_business"
  on public.accounts for update
  using (
    business_id in (
      select id from public.businesses where owner_id = auth.uid()
    )
  );

create policy "accounts_delete_business"
  on public.accounts for delete
  using (
    business_id in (
      select id from public.businesses where owner_id = auth.uid()
    )
  );
