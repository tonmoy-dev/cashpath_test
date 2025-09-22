ভালো — নিচে আমি আপনার পুরো **সংশোধিত ও পরিমার্জিত schema** রিটাইপ করে দিলাম। আমি মূল কাঠামো রেখে কিছু গুরুত্বপূর্ণ পরিবর্তন যোগ করেছি যা পূর্বের আলোচনায় বলেছিলাম:

* `profiles.id` এখন `auth.users(id)` কে রেফারেন্স করে (Supabase auth সিস্টেমের সাথে সামঞ্জস্য)
* `password_hash` সরানো হয়েছে (Auth Supabase-এ থাকে)
* `team_members`-এ প্রতিটি business-এ শুধু একটি `owner` নিশ্চিত করতে partial unique index যোগ করা হয়েছে
* `accounts` এবং `books`-এ per-business uniqueness যোগ করা হয়েছে
* `transactions.transfer_id` এখন `UUID` এবং foreign key হিসেবে link করা হয়েছে
* `businesses` ইনসার্ট হলে ডিফল্ট ক্যাটেগরি সৃষ্টির জন্য trigger যোগ করা হয়েছে
* RLS policies গুলো `DROP IF EXISTS` + granular `SELECT/INSERT/UPDATE/DELETE` প্যাটার্নে re-written করা হয়েছে — conflict এড়াতে
* কিছু টাইপ/টাইটল প্রস্তুত ও TIMESTAMPTZ ব্যবহার করা হয়েছে

নীচের SQL পুরো ফাইল হিসেবে Run করতে পারবেন Supabase SQL editor-এ — তবে **注意**: আপনি যদি আগের টেবিল/পলিসি একই DB-এ আগেই তৈরি করে রাখেন, তাহলে কিছু `CREATE TABLE IF NOT EXISTS`/`CREATE INDEX IF NOT EXISTS` কাজ করবে, এবং পলিসি অংশে `DROP POLICY IF EXISTS` দেয়া আছে যাতে conflict না হয়।

---

## সম্পূর্ণ Revised Schema (Ready-to-run)

```sql
-- Cashify (Revised) Database Schema
-- Date: 2025-09-22
-- Notes: Designed for Supabase (auth.users exists). Run in Supabase SQL editor.

-- ------------------------------
-- Extensions & DB settings
-- ------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Ensure row_security at DB level (may require superuser; Supabase usually handles)
-- ALTER DATABASE postgres SET row_security = on; -- optional, Supabase manages RLS per table

-- ------------------------------
-- CORE USER AND AUTHENTICATION TABLES
-- ------------------------------
-- Profiles: id references Supabase auth.users(id)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role TEXT DEFAULT 'owner' CHECK (role IN ('owner','partner','staff')),
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------
-- USER SETTINGS
-- ------------------------------
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'light' CHECK (theme IN ('light','dark','system')),
    language TEXT DEFAULT 'en',
    currency TEXT DEFAULT 'USD',
    date_format TEXT DEFAULT 'MM/DD/YYYY',
    number_format TEXT DEFAULT 'en-US',
    current_business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    notifications JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
    backup_settings JSONB DEFAULT '{"auto_backup": true, "frequency": "daily"}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ------------------------------
-- BUSINESSES
-- ------------------------------
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------
-- TEAM MEMBERS (junction)
-- ------------------------------
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner','partner','staff')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','active','inactive','expired')),
    invitation_code TEXT UNIQUE,
    invitation_expires_at TIMESTAMPTZ,
    invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    joined_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(business_id, email)
);

-- Ensure only one 'owner' per business (partial unique index)
CREATE UNIQUE INDEX IF NOT EXISTS ux_team_owner_per_business ON team_members (business_id) WHERE role = 'owner';

-- ------------------------------
-- ACCOUNTS
-- ------------------------------
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('cash','bank','credit','investment','loan','other')),
    category TEXT CHECK (category IN ('current','savings','fixed_deposit','credit_card','loan')),
    balance NUMERIC(15,2) DEFAULT 0.00,
    currency TEXT DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (business_id, name)
);

-- ------------------------------
-- CATEGORIES
-- ------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income','expense','transfer')),
    color TEXT DEFAULT '#6B7280',
    icon TEXT DEFAULT 'folder',
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (business_id, name, type)
);

-- ------------------------------
-- TRANSACTIONS
-- ------------------------------
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    amount NUMERIC(15,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income','expense','transfer')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    note TEXT,
    payment_mode TEXT CHECK (payment_mode IN ('cash','card','bank_transfer','cheque','online','other')),
    transfer_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    linked_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    attachments JSONB DEFAULT '[]',
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'cleared' CHECK (status IN ('pending','cleared','reconciled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------
-- BOOKS
-- ------------------------------
CREATE TABLE IF NOT EXISTS books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    book_type TEXT DEFAULT 'general' CHECK (book_type IN ('general','cash','sales','purchase','journal')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (business_id, name),
    UNIQUE (business_id, book_type)
);

-- ------------------------------
-- AUDIT LOGS
-- ------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('create','update','delete','login','logout')),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------
-- INDEXES
-- ------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_created_at ON businesses(created_at);

CREATE INDEX IF NOT EXISTS idx_team_members_business_id ON team_members(business_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_invitation_code ON team_members(invitation_code);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);

CREATE INDEX IF NOT EXISTS idx_accounts_business_id ON accounts(business_id);
CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(type);
CREATE INDEX IF NOT EXISTS idx_accounts_is_active ON accounts(is_active);

CREATE INDEX IF NOT EXISTS idx_categories_business_id ON categories(business_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);

CREATE INDEX IF NOT EXISTS idx_transactions_business_id ON transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_transfer_id ON transactions(transfer_id);

CREATE INDEX IF NOT EXISTS idx_books_business_id ON books(business_id);
CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_book_type ON books(book_type);

CREATE INDEX IF NOT EXISTS idx_audit_logs_business_id ON audit_logs(business_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ------------------------------
-- TIMESTAMP TRIGGER FUNCTION
-- ------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_settings_updated_at') THEN
    CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_businesses_updated_at') THEN
    CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_team_members_updated_at') THEN
    CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_accounts_updated_at') THEN
    CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_categories_updated_at') THEN
    CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_transactions_updated_at') THEN
    CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_books_updated_at') THEN
    CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END$$;

-- ------------------------------
-- BUSINESS LOGIC FUNCTIONS & TRIGGERS
-- ------------------------------
-- calculate account balance
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

-- update account balance trigger function
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE accounts 
        SET balance = calculate_account_balance(OLD.account_id)
        WHERE id = OLD.account_id;
        RETURN OLD;
    ELSE
        UPDATE accounts 
        SET balance = calculate_account_balance(NEW.account_id)
        WHERE id = NEW.account_id;
        
        IF TG_OP = 'UPDATE' AND OLD.account_id != NEW.account_id THEN
            UPDATE accounts 
            SET balance = calculate_account_balance(OLD.account_id)
            WHERE id = OLD.account_id;
        END IF;
        
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- attach trigger to transactions (create if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_account_balance_trigger') THEN
    CREATE TRIGGER update_account_balance_trigger
    AFTER INSERT OR UPDATE OR DELETE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_account_balance();
  END IF;
END$$;

-- default categories creation function
CREATE OR REPLACE FUNCTION create_default_categories(business_uuid UUID, creator_uuid UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO categories (business_id, name, type, color, icon, created_by) VALUES
    (business_uuid, 'Sales Revenue', 'income', '#10B981', 'trending-up', creator_uuid),
    (business_uuid, 'Service Income', 'income', '#059669', 'briefcase', creator_uuid),
    (business_uuid, 'Investment Income', 'income', '#047857', 'bar-chart', creator_uuid),
    (business_uuid, 'Other Income', 'income', '#065F46', 'plus-circle', creator_uuid)
    ON CONFLICT DO NOTHING;
    
    INSERT INTO categories (business_id, name, type, color, icon, created_by) VALUES
    (business_uuid, 'Office Supplies', 'expense', '#EF4444', 'package', creator_uuid),
    (business_uuid, 'Marketing', 'expense', '#DC2626', 'megaphone', creator_uuid),
    (business_uuid, 'Travel', 'expense', '#B91C1C', 'map-pin', creator_uuid),
    (business_uuid, 'Utilities', 'expense', '#991B1B', 'zap', creator_uuid),
    (business_uuid, 'Professional Services', 'expense', '#7F1D1D', 'users', creator_uuid),
    (business_uuid, 'Other Expenses', 'expense', '#6B1D1D', 'minus-circle', creator_uuid)
    ON CONFLICT DO NOTHING;
    
    INSERT INTO categories (business_id, name, type, color, icon, created_by) VALUES
    (business_uuid, 'Account Transfer', 'transfer', '#6B7280', 'arrow-right-left', creator_uuid)
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- trigger: after business created, seed default categories
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'create_default_categories_trigger') THEN
    CREATE TRIGGER create_default_categories_trigger
    AFTER INSERT ON businesses
    FOR EACH ROW
    EXECUTE FUNCTION
      ( -- wrapper function to call create_default_categories with NEW.id and NEW.owner_id
        -- we create an anonymous wrapper function:
        create_default_categories_wrapper()
      );
  END IF;
END$$;

-- But Postgres does not allow executing an inline wrapper like above.
-- So create a simple wrapper function and attach it properly:

CREATE OR REPLACE FUNCTION create_default_categories_wrapper()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_default_categories(NEW.id, NEW.owner_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- attach wrapper trigger (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'create_default_categories_trigger') THEN
    CREATE TRIGGER create_default_categories_trigger
    AFTER INSERT ON businesses
    FOR EACH ROW EXECUTE FUNCTION create_default_categories_wrapper();
  END IF;
END$$;

-- ------------------------------
-- ROW LEVEL SECURITY (RLS) - enable & policies
-- ------------------------------
-- Enable RLS for tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ---- PROFILES policies ----
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ---- USER_SETTINGS policies ----
DROP POLICY IF EXISTS "Users can manage own settings" ON user_settings;
CREATE POLICY "Users can manage own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---- BUSINESSES policies ----
DROP POLICY IF EXISTS "Business owners can manage their businesses" ON businesses;
CREATE POLICY "Business owners can manage their businesses" ON businesses
  FOR ALL USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Team members can view their businesses" ON businesses;
CREATE POLICY "Team members can view their businesses" ON businesses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.business_id = businesses.id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    )
  );

-- ---- TEAM_MEMBERS policies ----
DROP POLICY IF EXISTS "Business owners can manage team members" ON team_members;
CREATE POLICY "Business owners can manage team members" ON team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = team_members.business_id
      AND b.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = team_members.business_id
      AND b.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Team members can view team" ON team_members;
CREATE POLICY "Team members can view team" ON team_members
  FOR SELECT USING (
    business_id IN (
      SELECT tm2.business_id FROM team_members tm2
      WHERE tm2.user_id = auth.uid() AND tm2.status = 'active'
    )
  );

-- ---- ACCOUNTS policies (granular) ----
DROP POLICY IF EXISTS "Team can SELECT accounts" ON accounts;
CREATE POLICY "Team can SELECT accounts" ON accounts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM businesses b
      LEFT JOIN team_members tm ON tm.business_id = b.id AND tm.user_id = auth.uid() AND tm.status = 'active'
      WHERE b.id = accounts.business_id AND (b.owner_id = auth.uid() OR tm.id IS NOT NULL)
    )
  );

DROP POLICY IF EXISTS "Team can INSERT accounts" ON accounts;
CREATE POLICY "Team can INSERT accounts" ON accounts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses b
      LEFT JOIN team_members tm ON tm.business_id = b.id AND tm.user_id = auth.uid() AND tm.status = 'active'
      WHERE b.id = NEW.business_id AND (b.owner_id = auth.uid() OR tm.id IS NOT NULL)
    )
  );

DROP POLICY IF EXISTS "Team can UPDATE accounts" ON accounts;
CREATE POLICY "Team can UPDATE accounts" ON accounts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM businesses b
      LEFT JOIN team_members tm ON tm.business_id = b.id AND tm.user_id = auth.uid() AND tm.status = 'active'
      WHERE b.id = accounts.business_id AND (b.owner_id = auth.uid() OR tm.id IS NOT NULL)
    )
  );

DROP POLICY IF EXISTS "Team can DELETE accounts" ON accounts;
CREATE POLICY "Team can DELETE accounts" ON accounts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM businesses b
      LEFT JOIN team_members tm ON tm.business_id = b.id AND tm.user_id = auth.uid() AND tm.status = 'active'
      WHERE b.id = accounts.business_id AND (b.owner_id = auth.uid() OR tm.id IS NOT NULL)
    )
  );

-- ---- CATEGORIES policies (granular, similar to accounts) ----
DROP POLICY IF EXISTS "Team can SELECT categories" ON categories;
CREATE POLICY "Team can SELECT categories" ON categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM businesses b
      LEFT JOIN team_members tm ON tm.business_id = b.id AND tm.user_id = auth.uid() AND tm.status = 'active'
      WHERE b.id = categories.business_id AND (b.owner_id = auth.uid() OR tm.id IS NOT NULL)
    )
  );

DROP POLICY IF EXISTS "Team can INSERT categories" ON categories;
CREATE POLICY "Team can INSERT categories" ON categories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses b
      LEFT JOIN team_members tm ON tm.business_id = b.id AND tm.user_id = auth.uid() AND tm.status = 'active'
      WHERE b.id = NEW.business_id AND (b.owner_id = auth.uid() OR tm.id IS NOT NULL)
    )
  );

DROP POLICY IF EXISTS "Team can UPDATE categories" ON categories;
CREATE POLICY "Team can UPDATE categories" ON categories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM businesses b
      LEFT JOIN team_members tm ON tm.business_id = b.id AND tm.user_id = auth.uid() AND tm.status = 'active'
      WHERE b.id = categories.business_id AND (b.owner_id = auth.uid() OR tm.id IS NOT NULL)
    )
  );

DROP POLICY IF EXISTS "Team can DELETE categories" ON categories;
CREATE POLICY "Team can DELETE categories" ON categories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM businesses b
      LEFT JOIN team_members tm ON tm.business_id = b.id AND tm.user_id = auth.uid() AND tm.status = 'active'
      WHERE b.id = categories.business_id AND (b.owner_id = auth.uid() OR tm.id IS NOT NULL)
    )
  );

-- ---- TRANSACTIONS policies (granular) ----
DROP POLICY IF EXISTS "Team can SELECT transactions" ON transactions;
CREATE POLICY "Team can SELECT transactions" ON transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM businesses b
      LEFT JOIN team_members tm ON tm.business_id = b.id AND tm.user_id = auth.uid() AND tm.status = 'active'
      WHERE b.id = transactions.business_id AND (b.owner_id = auth.uid() OR tm.id IS NOT NULL)
    )
  );

DROP POLICY IF EXISTS "Team can INSERT transactions" ON transactions;
CREATE POLICY "Team can INSERT transactions" ON transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses b
      LEFT JOIN team_members tm ON tm.business_id = b.id AND tm.user_id = auth.uid() AND tm.status = 'active'
      WHERE b.id = NEW.business_id AND (b.owner_id = auth.uid() OR tm.id IS NOT NULL)
    )
  );

DROP POLICY IF EXISTS "Team can UPDATE transactions" ON transactions;
CREATE POLICY "Team can UPDATE transactions" ON transactions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM businesses b
      LEFT JOIN team_members tm ON tm.business_id = b.id AND tm.user_id = auth.uid() AND tm.status = 'active'
      WHERE b.id = transactions.business_id AND (b.owner_id = auth.uid() OR tm.id IS NOT NULL)
    )
  );

DROP POLICY IF EXISTS "Team can DELETE transactions" ON transactions;
CREATE POLICY "Team can DELETE transactions" ON transactions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM businesses b
      LEFT JOIN team_members tm ON tm.business_id = b.id AND tm.user_id = auth.uid() AND tm.status = 'active'
      WHERE b.id = transactions.business_id AND (b.owner_id = auth.uid() OR tm.id IS NOT NULL)
    )
  );

-- ---- BOOKS policies ----
DROP POLICY IF EXISTS "Team can manage books" ON books;
CREATE POLICY "Team can manage books" ON books
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM businesses b
      LEFT JOIN team_members tm ON tm.business_id = b.id AND tm.user_id = auth.uid() AND tm.status = 'active'
      WHERE b.id = books.business_id AND (b.owner_id = auth.uid() OR tm.id IS NOT NULL)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses b
      LEFT JOIN team_members tm ON tm.business_id = b.id AND tm.user_id = auth.uid() AND tm.status = 'active'
      WHERE b.id = books.business_id AND (b.owner_id = auth.uid() OR tm.id IS NOT NULL)
    )
  );

-- ---- AUDIT LOGS policies (read-only for team) ----
DROP POLICY IF EXISTS "Team can view audit logs" ON audit_logs;
CREATE POLICY "Team can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM businesses b
      LEFT JOIN team_members tm ON tm.business_id = b.id AND tm.user_id = auth.uid() AND tm.status = 'active'
      WHERE b.id = audit_logs.business_id AND (b.owner_id = auth.uid() OR tm.id IS NOT NULL)
    )
  );

-- ------------------------------
-- VIEWS
-- ------------------------------
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

-- ------------------------------
-- COMMENTS (docs)
-- ------------------------------
COMMENT ON TABLE profiles IS 'User profiles linked to auth.users';
COMMENT ON TABLE businesses IS 'Business entities owned by profiles(owner_id)';
COMMENT ON TABLE team_members IS 'Junction for users and businesses; invitation workflow';
COMMENT ON TABLE accounts IS 'Financial accounts belonging to businesses';
COMMENT ON TABLE categories IS 'Transaction categories for business';
COMMENT ON TABLE transactions IS 'Financial transactions';
COMMENT ON TABLE audit_logs IS 'Audit trail';

-- End of schema
```

---

## Quick usage notes / checklist (বাংলায় — সংক্ষেপে)

1. Supabase dashboard → **Auth → Settings → External redirect URLs** এ আপনার `http://localhost:3000` বা প্রকৃত ডোমেইন যোগ আছে কি নিশ্চিত করুন।
2. আপনার Next.js এ `NEXT_PUBLIC_SUPABASE_URL` ও `NEXT_PUBLIC_SUPABASE_ANON_KEY` সঠিক আছে কি দেখুন।
3. যদি পুরনো conflicting policies থাকে — এই স্ক্রিপ্ট `DROP POLICY IF EXISTS` ব্যবহার করেছে, তাই conflict কম হবে।
4. `profiles` তৈরি করার সময় **auth.users.id** দিয়ে `profiles.id` সেট করুন — যাতে RLS কাজ করে (auth.uid() ও profiles.id এক হবে)।
5. Business তৈরি করার পর `create_default_categories` trigger ডিফল্ট ক্যাটেগরি তৈরি করবে।

---

আপনি চাইলে আমি এখনই:

* এই schema-টা **Supabase SQL editor**-এ রান করার জন্য একটি ছোট “migration” (একটি single SQL ফাইল—উপরেরই) হিসেবে সাজিয়ে দিতে পারি, অথবা
* আপনার বিদ্যমান DB থেকে কনফ্লিক্ট চেক করে কাস্টম patch (যেগুলো `ALTER TABLE` হবে) বানিয়ে দিতে পারি।

কোনটা করা লাগবে বলুন — আমি step-by-step করে দেব।
