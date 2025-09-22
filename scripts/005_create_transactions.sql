-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  -- Updated transaction types to match Cashify's income/expense/transfer structure
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer-in', 'transfer-out')),
  amount DECIMAL(15,2) NOT NULL,
  description TEXT NOT NULL,
  note TEXT,
  category_id UUID REFERENCES public.categories(id),
  payment_mode TEXT DEFAULT 'Cash',
  -- Added transfer-related fields for account transfers
  transfer_id TEXT,
  linked_transaction_id UUID REFERENCES public.transactions(id),
  from_account_id UUID REFERENCES public.accounts(id),
  to_account_id UUID REFERENCES public.accounts(id),
  -- Added attachments support as JSONB
  attachments JSONB DEFAULT '[]',
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transactions
CREATE POLICY "transactions_select_by_business_access" ON public.transactions 
  FOR SELECT USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
      UNION
      SELECT business_id FROM public.team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "transactions_insert_by_business_access" ON public.transactions 
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
      UNION
      SELECT business_id FROM public.team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "transactions_update_by_business_access" ON public.transactions 
  FOR UPDATE USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
      UNION
      SELECT business_id FROM public.team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "transactions_delete_by_business_access" ON public.transactions 
  FOR DELETE USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
      UNION
      SELECT business_id FROM public.team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS transactions_business_id_idx ON public.transactions(business_id);
CREATE INDEX IF NOT EXISTS transactions_account_id_idx ON public.transactions(account_id);
CREATE INDEX IF NOT EXISTS transactions_date_idx ON public.transactions(transaction_date);
CREATE INDEX IF NOT EXISTS transactions_type_idx ON public.transactions(type);
