-- Create categories table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text check (type in ('income', 'expense')) not null,
  business_id uuid references public.businesses(id) on delete cascade,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.categories enable row level security;

-- Create policies for categories
create policy "categories_select_business"
  on public.categories for select
  using (
    business_id in (
      select id from public.businesses where owner_id = auth.uid()
    )
  );

create policy "categories_insert_business"
  on public.categories for insert
  with check (
    business_id in (
      select id from public.businesses where owner_id = auth.uid()
    )
  );

create policy "categories_update_business"
  on public.categories for update
  using (
    business_id in (
      select id from public.businesses where owner_id = auth.uid()
    )
  );

create policy "categories_delete_business"
  on public.categories for delete
  using (
    business_id in (
      select id from public.businesses where owner_id = auth.uid()
    )
  );
