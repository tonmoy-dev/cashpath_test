-- Create accounts table
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  -- Updated account types to match Cashify's Cash/Bank/Mobile Banking structure
  type TEXT NOT NULL CHECK (type IN ('Cash', 'Bank', 'Mobile Banking', 'Credit Card', 'Other')),
  category TEXT,
  balance DECIMAL(15,2) DEFAULT 0,
  currency TEXT DEFAULT 'BDT',
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for accounts
CREATE POLICY "accounts_select_by_business_access" ON public.accounts 
  FOR SELECT USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
      UNION
      SELECT business_id FROM public.team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "accounts_insert_by_business_access" ON public.accounts 
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
      UNION
      SELECT business_id FROM public.team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "accounts_update_by_business_access" ON public.accounts 
  FOR UPDATE USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
      UNION
      SELECT business_id FROM public.team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "accounts_delete_by_business_owner" ON public.accounts 
  FOR DELETE USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    )
  );
