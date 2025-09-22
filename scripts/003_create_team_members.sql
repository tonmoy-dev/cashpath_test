-- Create team_members table (unified with invitations)
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('partner', 'staff')) DEFAULT 'staff',
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'inactive')) DEFAULT 'pending',
  invitation_code TEXT UNIQUE,
  invitation_expires_at TIMESTAMP WITH TIME ZONE,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_members
-- Business owners can manage all team members
CREATE POLICY "team_members_select_by_business_owner" ON public.team_members 
  FOR SELECT USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "team_members_insert_by_business_owner" ON public.team_members 
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "team_members_update_by_business_owner" ON public.team_members 
  FOR UPDATE USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "team_members_delete_by_business_owner" ON public.team_members 
  FOR DELETE USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    )
  );

-- Team members can view their own record
CREATE POLICY "team_members_select_own" ON public.team_members 
  FOR SELECT USING (auth.uid() = user_id);
