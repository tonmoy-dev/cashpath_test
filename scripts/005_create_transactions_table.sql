-- Create transactions table
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  date date not null,
  amount decimal(15,2) not null,
  type text check (type in ('income', 'expense', 'transfer-out', 'transfer-in')) not null,
  payment_mode text not null default 'Cash',
  note text,
  attachments jsonb default '[]'::jsonb,
  transfer_id text,
  linked_transaction_id uuid,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.transactions enable row level security;

-- Create policies for transactions
create policy "transactions_select_business"
  on public.transactions for select
  using (
    business_id in (
      select id from public.businesses where owner_id = auth.uid()
    )
  );

create policy "transactions_insert_business"
  on public.transactions for insert
  with check (
    business_id in (
      select id from public.businesses where owner_id = auth.uid()
    )
  );

create policy "transactions_update_business"
  on public.transactions for update
  using (
    business_id in (
      select id from public.businesses where owner_id = auth.uid()
    )
  );

create policy "transactions_delete_business"
  on public.transactions for delete
  using (
    business_id in (
      select id from public.businesses where owner_id = auth.uid()
    )
  );
