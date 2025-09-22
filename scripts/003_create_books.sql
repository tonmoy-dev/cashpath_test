-- Create books table
create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  book_type text not null check (book_type in ('general', 'expense', 'income', 'project', 'payable', 'receivable')),
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.books enable row level security;

-- Create policies for books
create policy "books_select_own"
  on public.books for select
  using (auth.uid() = user_id);

create policy "books_insert_own"
  on public.books for insert
  with check (auth.uid() = user_id);

create policy "books_update_own"
  on public.books for update
  using (auth.uid() = user_id);

create policy "books_delete_own"
  on public.books for delete
  using (auth.uid() = user_id);

-- Create indexes
create index if not exists books_user_id_idx on public.books(user_id);
create index if not exists books_business_id_idx on public.books(business_id);
