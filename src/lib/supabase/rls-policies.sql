-- ============================================
-- Talisto - Row Level Security (RLS) Policies
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================

-- Helper function: get the company_id for the current authenticated user
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- 1. COMPANIES
-- ============================================
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own company"
  ON companies FOR SELECT
  USING (id = get_user_company_id());

CREATE POLICY "Users can update their own company"
  ON companies FOR UPDATE
  USING (id = get_user_company_id());

-- Allow INSERT for new signups (no company yet)
CREATE POLICY "Authenticated users can create a company"
  ON companies FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- 2. USERS
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view members of their company"
  ON users FOR SELECT
  USING (company_id = get_user_company_id() OR id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- ============================================
-- 3. PRODUCTS
-- ============================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company products"
  ON products FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert products for their company"
  ON products FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update their company products"
  ON products FOR UPDATE
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can delete their company products"
  ON products FOR DELETE
  USING (company_id = get_user_company_id());

-- ============================================
-- 4. INVENTORY_TRANSACTIONS
-- ============================================
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company transactions"
  ON inventory_transactions FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert transactions for their company"
  ON inventory_transactions FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

-- ============================================
-- 5. SALES
-- ============================================
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company sales"
  ON sales FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert sales for their company"
  ON sales FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update their company sales"
  ON sales FOR UPDATE
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can delete their company sales"
  ON sales FOR DELETE
  USING (company_id = get_user_company_id());

-- ============================================
-- 6. CUSTOMERS
-- ============================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company customers"
  ON customers FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert customers for their company"
  ON customers FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update their company customers"
  ON customers FOR UPDATE
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can delete their company customers"
  ON customers FOR DELETE
  USING (company_id = get_user_company_id());

-- ============================================
-- 7. PROJECTS
-- ============================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company projects"
  ON projects FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert projects for their company"
  ON projects FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update their company projects"
  ON projects FOR UPDATE
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can delete their company projects"
  ON projects FOR DELETE
  USING (company_id = get_user_company_id());

-- ============================================
-- 8. INTEGRATIONS
-- ============================================
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company integrations"
  ON integrations FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert integrations for their company"
  ON integrations FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update their company integrations"
  ON integrations FOR UPDATE
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can delete their company integrations"
  ON integrations FOR DELETE
  USING (company_id = get_user_company_id());

-- ============================================
-- 9. AI_RECOMMENDATIONS
-- ============================================
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company recommendations"
  ON ai_recommendations FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert recommendations for their company"
  ON ai_recommendations FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update their company recommendations"
  ON ai_recommendations FOR UPDATE
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can delete their company recommendations"
  ON ai_recommendations FOR DELETE
  USING (company_id = get_user_company_id());
