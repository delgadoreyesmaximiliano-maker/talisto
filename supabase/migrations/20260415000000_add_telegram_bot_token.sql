-- Add telegram_bot_token to companies table
-- Allows users to configure their own bot token

ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS telegram_bot_token VARCHAR(255);