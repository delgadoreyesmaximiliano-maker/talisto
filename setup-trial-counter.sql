-- Add trial and subscription tracking columns
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS plan_status VARCHAR(20) DEFAULT 'trial' 
  CHECK (plan_status IN ('trial', 'active', 'expired', 'cancelled')),
ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP;

-- Backfill existing companies with retroactive trial dates
-- Assumes 14-day trial from account creation
UPDATE companies 
SET trial_ends_at = created_at + INTERVAL '14 days',
    plan_status = CASE 
      WHEN created_at + INTERVAL '14 days' > NOW() THEN 'trial'
      ELSE 'expired'
    END
WHERE trial_ends_at IS NULL;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_companies_plan_status 
  ON companies(plan_status);
CREATE INDEX IF NOT EXISTS idx_companies_trial_ends 
  ON companies(trial_ends_at) 
  WHERE plan_status = 'trial';

-- Add comment for documentation
COMMENT ON COLUMN companies.trial_ends_at IS 
  'Trial expiration timestamp. NULL if never had trial (direct paid signup)';
COMMENT ON COLUMN companies.plan_status IS 
  'Current subscription status: trial, active, expired, cancelled';
