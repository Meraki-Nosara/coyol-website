-- Add remaining_balance column to coyol_gift_cards for partial redemptions
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/mnxjzvqgrrodalcmtntf/sql

-- Add the column
ALTER TABLE coyol_gift_cards 
ADD COLUMN IF NOT EXISTS remaining_balance NUMERIC;

-- Set remaining_balance = amount for existing cards that aren't redeemed
UPDATE coyol_gift_cards 
SET remaining_balance = amount 
WHERE remaining_balance IS NULL AND status != 'redeemed';

-- For redeemed cards, set remaining_balance = 0
UPDATE coyol_gift_cards 
SET remaining_balance = 0 
WHERE remaining_balance IS NULL AND status = 'redeemed';

-- Verify
SELECT code, amount, remaining_balance, status FROM coyol_gift_cards;
