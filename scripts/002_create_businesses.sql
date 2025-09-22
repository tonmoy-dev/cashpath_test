-- Create businesses table
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for businesses
CREATE POLICY "businesses_select_by_owner" ON public.businesses 
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "businesses_insert_by_owner" ON public.businesses 
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "businesses_update_by_owner" ON public.businesses 
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "businesses_delete_by_owner" ON public.businesses 
  FOR DELETE USING (auth.uid() = owner_id);
