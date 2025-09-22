-- Insert default categories for new businesses
-- This will be called when a new business is created

-- Function to create default categories for a business
create or replace function public.create_default_categories(business_uuid uuid)
returns void
language plpgsql
security definer
as $$
begin
  -- Insert default income categories
  insert into public.categories (name, type, business_id) values
    ('Sales Revenue', 'income', business_uuid),
    ('Service Income', 'income', business_uuid),
    ('Interest Income', 'income', business_uuid),
    ('Other Income', 'income', business_uuid);

  -- Insert default expense categories
  insert into public.categories (name, type, business_id) values
    ('Office Supplies', 'expense', business_uuid),
    ('Marketing', 'expense', business_uuid),
    ('Travel', 'expense', business_uuid),
    ('Utilities', 'expense', business_uuid),
    ('Rent', 'expense', business_uuid),
    ('Salaries', 'expense', business_uuid),
    ('Professional Services', 'expense', business_uuid),
    ('Equipment', 'expense', business_uuid),
    ('Insurance', 'expense', business_uuid),
    ('Other Expenses', 'expense', business_uuid);
end;
$$;
