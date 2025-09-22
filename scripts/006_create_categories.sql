-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  color TEXT DEFAULT '#3B82F6',
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(business_id, name, type)
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories
CREATE POLICY "categories_select_by_business_access" ON public.categories 
  FOR SELECT USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
      UNION
      SELECT business_id FROM public.team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "categories_insert_by_business_access" ON public.categories 
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
      UNION
      SELECT business_id FROM public.team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "categories_update_by_business_access" ON public.categories 
  FOR UPDATE USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
      UNION
      SELECT business_id FROM public.team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "categories_delete_by_business_access" ON public.categories 
  FOR DELETE USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
      UNION
      SELECT business_id FROM public.team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS categories_business_id_idx ON public.categories(business_id);
CREATE INDEX IF NOT EXISTS categories_type_idx ON public.categories(type);
