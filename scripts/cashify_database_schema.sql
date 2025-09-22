-- Cashify Application Database Schema
-- Complete ER Diagram Implementation with Tables, Relationships, Indexes, and Constraints

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE postgres SET row_security = on;

-- =====================================================
-- CORE USER AND AUTHENTICATION TABLES
-- =====================================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role TEXT DEFAULT 'owner' CHECK (role IN ('owner', 'partner', 'staff')),
    avatar_url TEXT,
    phone TEXT,
    password_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
    language TEXT DEFAULT 'en',
    currency TEXT DEFAULT 'USD',
    date_format TEXT DEFAULT 'MM/DD/YYYY',
    number_format TEXT DEFAULT 'en-US',
    current_business_id UUID,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    notifications JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
    backup_settings JSONB DEFAULT '{"auto_backup": true, "frequency": "daily"}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- =====================================================
-- BUSINESS AND ORGANIZATION TABLES
-- =====================================================

-- Businesses table
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    website TEXT,
    logo_url TEXT,
    address TEXT,
    description TEXT,
    industry TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members table (many-to-many relationship between users and businesses)
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'partner', 'staff')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive', 'expired')),
    invitation_code TEXT UNIQUE,
    invitation_expires_at TIMESTAMP WITH TIME ZONE,
    invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    joined_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_id, email)
);

-- =====================================================
-- FINANCIAL MANAGEMENT TABLES
-- =====================================================

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('cash', 'bank', 'credit', 'investment', 'loan', 'other')),
    category TEXT CHECK (category IN ('current', 'savings', 'fixed_deposit', 'credit_card', 'loan')),
    balance NUMERIC(15,2) DEFAULT 0.00,
    currency TEXT DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    color TEXT DEFAULT '#6B7280',
    icon TEXT DEFAULT 'folder',
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_id, name, type)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    amount NUMERIC(15,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    note TEXT,
    payment_mode TEXT CHECK (payment_mode IN ('cash', 'card', 'bank_transfer', 'cheque', 'online', 'other')),
    transfer_id TEXT, -- For linking transfer transactions
    linked_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    attachments JSONB DEFAULT '[]',
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Books table (for different accounting books/journals)
CREATE TABLE IF NOT EXISTS books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    book_type TEXT DEFAULT 'general' CHECK (book_type IN ('general', 'cash', 'sales', 'purchase', 'journal')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_id, name)
);

-- =====================================================
-- AUDIT AND LOGGING TABLES
-- =====================================================

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    entity_type TEXT NOT NULL, -- 'transaction', 'account', 'business', etc.
    entity_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'login', 'logout')),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =====================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- User settings indexes
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Businesses indexes
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_created_at ON businesses(created_at);

-- Team members indexes
CREATE INDEX IF NOT EXISTS idx_team_members_business_id ON team_members(business_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_invitation_code ON team_members(invitation_code);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);

-- Accounts indexes
CREATE INDEX IF NOT EXISTS idx_accounts_business_id ON accounts(business_id);
CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(type);
CREATE INDEX IF NOT EXISTS idx_accounts_is_active ON accounts(is_active);

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_business_id ON categories(business_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_business_id ON transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_transfer_id ON transactions(transfer_id);

-- Books indexes
CREATE INDEX IF NOT EXISTS idx_books_business_id ON books(business_id);
CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_book_type ON books(book_type);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_business_id ON audit_logs(business_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- =====================================================

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at column
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- User settings policies
CREATE POLICY "Users can manage own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);

-- Business policies
CREATE POLICY "Business owners can manage their businesses" ON businesses FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Team members can view their businesses" ON businesses FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM team_members 
        WHERE team_members.business_id = businesses.id 
        AND team_members.user_id = auth.uid() 
        AND team_members.status = 'active'
    )
);

-- Team members policies
CREATE POLICY "Business owners can manage team members" ON team_members FOR ALL USING (
    EXISTS (
        SELECT 1 FROM businesses 
        WHERE businesses.id = team_members.business_id 
        AND businesses.owner_id = auth.uid()
    )
);
CREATE POLICY "Team members can view team" ON team_members FOR SELECT USING (
    business_id IN (
        SELECT business_id FROM team_members 
        WHERE user_id = auth.uid() AND status = 'active'
    )
);

-- Accounts policies
CREATE POLICY "Business team can manage accounts" ON accounts FOR ALL USING (
    business_id IN (
        SELECT business_id FROM team_members 
        WHERE user_id = auth.uid() AND status = 'active'
    )
);

-- Categories policies
CREATE POLICY "Business team can manage categories" ON categories FOR ALL USING (
    business_id IN (
        SELECT business_id FROM team_members 
        WHERE user_id = auth.uid() AND status = 'active'
    )
);

-- Transactions policies
CREATE POLICY "Business team can manage transactions" ON transactions FOR ALL USING (
    business_id IN (
        SELECT business_id FROM team_members 
        WHERE user_id = auth.uid() AND status = 'active'
    )
);

-- Books policies
CREATE POLICY "Business team can manage books" ON books FOR ALL USING (
    business_id IN (
        SELECT business_id FROM team_members 
        WHERE user_id = auth.uid() AND status = 'active'
    )
);

-- Audit logs policies
CREATE POLICY "Business team can view audit logs" ON audit_logs FOR SELECT USING (
    business_id IN (
        SELECT business_id FROM team_members 
        WHERE user_id = auth.uid() AND status = 'active'
    )
);

-- =====================================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- =====================================================

-- Function to calculate account balance
CREATE OR REPLACE FUNCTION calculate_account_balance(account_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
    total_balance NUMERIC := 0;
BEGIN
    SELECT COALESCE(
        SUM(CASE 
            WHEN type = 'income' THEN amount
            WHEN type = 'expense' THEN -amount
            ELSE 0
        END), 0
    ) INTO total_balance
    FROM transactions 
    WHERE account_id = account_uuid;
    
    RETURN total_balance;
END;
$$ LANGUAGE plpgsql;

-- Function to update account balance after transaction changes
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Update balance for the affected account
    IF TG_OP = 'DELETE' THEN
        UPDATE accounts 
        SET balance = calculate_account_balance(OLD.account_id)
        WHERE id = OLD.account_id;
        RETURN OLD;
    ELSE
        UPDATE accounts 
        SET balance = calculate_account_balance(NEW.account_id)
        WHERE id = NEW.account_id;
        
        -- If account changed, update old account balance too
        IF TG_OP = 'UPDATE' AND OLD.account_id != NEW.account_id THEN
            UPDATE accounts 
            SET balance = calculate_account_balance(OLD.account_id)
            WHERE id = OLD.account_id;
        END IF;
        
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update account balances
CREATE TRIGGER update_account_balance_trigger
    AFTER INSERT OR UPDATE OR DELETE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_account_balance();

-- Function to generate invitation code
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS TEXT AS $$
BEGIN
    RETURN upper(substring(md5(random()::text) from 1 for 8));
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INITIAL DATA SEEDING
-- =====================================================

-- Insert default categories for new businesses
CREATE OR REPLACE FUNCTION create_default_categories(business_uuid UUID, creator_uuid UUID)
RETURNS VOID AS $$
BEGIN
    -- Default income categories
    INSERT INTO categories (business_id, name, type, color, icon, created_by) VALUES
    (business_uuid, 'Sales Revenue', 'income', '#10B981', 'trending-up', creator_uuid),
    (business_uuid, 'Service Income', 'income', '#059669', 'briefcase', creator_uuid),
    (business_uuid, 'Investment Income', 'income', '#047857', 'bar-chart', creator_uuid),
    (business_uuid, 'Other Income', 'income', '#065F46', 'plus-circle', creator_uuid);
    
    -- Default expense categories
    INSERT INTO categories (business_id, name, type, color, icon, created_by) VALUES
    (business_uuid, 'Office Supplies', 'expense', '#EF4444', 'package', creator_uuid),
    (business_uuid, 'Marketing', 'expense', '#DC2626', 'megaphone', creator_uuid),
    (business_uuid, 'Travel', 'expense', '#B91C1C', 'map-pin', creator_uuid),
    (business_uuid, 'Utilities', 'expense', '#991B1B', 'zap', creator_uuid),
    (business_uuid, 'Professional Services', 'expense', '#7F1D1D', 'users', creator_uuid),
    (business_uuid, 'Other Expenses', 'expense', '#6B1D1D', 'minus-circle', creator_uuid);
    
    -- Default transfer category
    INSERT INTO categories (business_id, name, type, color, icon, created_by) VALUES
    (business_uuid, 'Account Transfer', 'transfer', '#6B7280', 'arrow-right-left', creator_uuid);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for business summary with team count
CREATE OR REPLACE VIEW business_summary AS
SELECT 
    b.*,
    COUNT(tm.id) as team_member_count,
    COUNT(a.id) as account_count,
    COALESCE(SUM(a.balance), 0) as total_balance
FROM businesses b
LEFT JOIN team_members tm ON b.id = tm.business_id AND tm.status = 'active'
LEFT JOIN accounts a ON b.id = a.business_id AND a.is_active = true
GROUP BY b.id;

-- View for transaction summary with category and account names
CREATE OR REPLACE VIEW transaction_details AS
SELECT 
    t.*,
    a.name as account_name,
    a.type as account_type,
    c.name as category_name,
    c.color as category_color,
    p.first_name || ' ' || p.last_name as created_by_name
FROM transactions t
LEFT JOIN accounts a ON t.account_id = a.id
LEFT JOIN categories c ON t.category_id = c.id
LEFT JOIN profiles p ON t.created_by = p.id;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth.users with additional business information';
COMMENT ON TABLE businesses IS 'Business entities that can have multiple team members and financial accounts';
COMMENT ON TABLE team_members IS 'Junction table for many-to-many relationship between users and businesses';
COMMENT ON TABLE accounts IS 'Financial accounts (cash, bank, credit, etc.) belonging to businesses';
COMMENT ON TABLE categories IS 'Transaction categories for income, expense, and transfer classification';
COMMENT ON TABLE transactions IS 'Financial transactions with full audit trail and categorization';
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for all business operations';
COMMENT ON TABLE user_settings IS 'User preferences and application settings';
COMMENT ON TABLE books IS 'Accounting books/journals for different types of financial records';

-- End of Cashify Database Schema
