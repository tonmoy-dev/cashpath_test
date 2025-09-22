-- Add password_hash column to profiles table for Auth.js credentials
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Update existing profiles to have proper timestamps
UPDATE profiles 
SET updated_at = NOW() 
WHERE updated_at IS NULL;

-- Add trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
