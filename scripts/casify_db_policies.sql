-- ===============================
-- PROFILES POLICIES
-- ===============================
drop policy if exists "Users can view own profile" on profiles;
create policy "Users can view own profile" on profiles
for select
using (auth.uid() = id);

drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile" on profiles
for update
using (auth.uid() = id);

-- ===============================
-- USER SETTINGS POLICIES
-- ===============================
drop policy if exists "Users can manage own settings" on user_settings;
create policy "Users can manage own settings" on user_settings
for all
using (auth.uid() = user_id);

-- ===============================
-- BUSINESSES POLICIES
-- ===============================
drop policy if exists "Business owners can manage their businesses" on businesses;
create policy "Business owners can manage their businesses" on businesses
for all
using (auth.uid() = owner_id);

drop policy if exists "Team members can view their businesses" on businesses;
create policy "Team members can view their businesses" on businesses
for select
using (
    exists (
        select 1 from team_members 
        where team_members.business_id = businesses.id
        and team_members.user_id = auth.uid()
        and team_members.status = 'active'
    )
);

-- ===============================
-- TEAM MEMBERS POLICIES
-- ===============================
drop policy if exists "Business owners can manage team members" on team_members;
create policy "Business owners can manage team members" on team_members
for all
using (
    exists (
        select 1 from businesses
        where businesses.id = team_members.business_id
        and businesses.owner_id = auth.uid()
    )
);

drop policy if exists "Team members can view team" on team_members;
create policy "Team members can view team" on team_members
for select
using (
    business_id in (
        select business_id from team_members
        where user_id = auth.uid()
        and status = 'active'
    )
);

-- ===============================
-- ACCOUNTS POLICIES
-- ===============================
drop policy if exists "Business team can manage accounts" on accounts;
create policy "Business team can manage accounts" on accounts
for all
using (
    business_id in (
        select business_id from team_members
        where user_id = auth.uid()
        and status = 'active'
    )
);

-- ===============================
-- CATEGORIES POLICIES
-- ===============================
drop policy if exists "Business team can manage categories" on categories;
create policy "Business team can manage categories" on categories
for all
using (
    business_id in (
        select business_id from team_members
        where user_id = auth.uid()
        and status = 'active'
    )
);

-- ===============================
-- TRANSACTIONS POLICIES
-- ===============================
drop policy if exists "Business team can manage transactions" on transactions;
create policy "Business team can manage transactions" on transactions
for all
using (
    business_id in (
        select business_id from team_members
        where user_id = auth.uid()
        and status = 'active'
    )
);

-- ===============================
-- BOOKS POLICIES
-- ===============================
drop policy if exists "Business team can manage books" on books;
create policy "Business team can manage books" on books
for all
using (
    business_id in (
        select business_id from team_members
        where user_id = auth.uid()
        and status = 'active'
    )
);

-- ===============================
-- AUDIT LOGS POLICIES
-- ===============================
drop policy if exists "Business team can view audit logs" on audit_logs;
create policy "Business team can view audit logs" on audit_logs
for select
using (
    business_id in (
        select business_id from team_members
        where user_id = auth.uid()
        and status = 'active'
    )
);
