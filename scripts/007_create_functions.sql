-- Function to update account balance
CREATE OR REPLACE FUNCTION update_account_balance(account_id UUID, amount_change DECIMAL)
RETURNS VOID AS $$
BEGIN
  UPDATE accounts 
  SET balance = balance + amount_change,
      updated_at = NOW()
  WHERE id = account_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
