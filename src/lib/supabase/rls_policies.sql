-- ============================================================
-- Talisto - Row Level Security Policies
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================
-- Patrón: auth.uid() → users.id → users.company_id
-- Cada usuario solo accede a datos de su propia empresa.
-- ============================================================

-- Helper function: obtiene el company_id del usuario autenticado
CREATE OR REPLACE FUNCTION get_my_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM users WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ============================================================
-- 1. COMPANIES
-- ============================================================
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "companies_select_own" ON companies
  FOR SELECT USING (id = get_my_company_id());

CREATE POLICY "companies_update_own" ON companies
  FOR UPDATE USING (id = get_my_company_id());

-- ============================================================
-- 2. USERS
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_company" ON users
  FOR SELECT USING (company_id = get_my_company_id());

CREATE POLICY "users_insert_own_company" ON users
  FOR INSERT WITH CHECK (company_id = get_my_company_id());

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (id = auth.uid());

-- Política especial: permitir inserción al registrarse (sin company_id aún)
CREATE POLICY "users_insert_self" ON users
  FOR INSERT WITH CHECK (id = auth.uid());

-- ============================================================
-- 3. PRODUCTS
-- ============================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_select_own" ON products
  FOR SELECT USING (company_id = get_my_company_id());

CREATE POLICY "products_insert_own" ON products
  FOR INSERT WITH CHECK (company_id = get_my_company_id());

CREATE POLICY "products_update_own" ON products
  FOR UPDATE USING (company_id = get_my_company_id());

CREATE POLICY "products_delete_own" ON products
  FOR DELETE USING (company_id = get_my_company_id());

-- ============================================================
-- 4. INVENTORY_TRANSACTIONS
-- ============================================================
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inv_transactions_select_own" ON inventory_transactions
  FOR SELECT USING (company_id = get_my_company_id());

CREATE POLICY "inv_transactions_insert_own" ON inventory_transactions
  FOR INSERT WITH CHECK (company_id = get_my_company_id());

-- ============================================================
-- 5. SALES
-- ============================================================
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sales_select_own" ON sales
  FOR SELECT USING (company_id = get_my_company_id());

CREATE POLICY "sales_insert_own" ON sales
  FOR INSERT WITH CHECK (company_id = get_my_company_id());

CREATE POLICY "sales_update_own" ON sales
  FOR UPDATE USING (company_id = get_my_company_id());

CREATE POLICY "sales_delete_own" ON sales
  FOR DELETE USING (company_id = get_my_company_id());

-- ============================================================
-- 6. CUSTOMERS
-- ============================================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customers_select_own" ON customers
  FOR SELECT USING (company_id = get_my_company_id());

CREATE POLICY "customers_insert_own" ON customers
  FOR INSERT WITH CHECK (company_id = get_my_company_id());

CREATE POLICY "customers_update_own" ON customers
  FOR UPDATE USING (company_id = get_my_company_id());

CREATE POLICY "customers_delete_own" ON customers
  FOR DELETE USING (company_id = get_my_company_id());

-- ============================================================
-- 7. PROJECTS
-- ============================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_select_own" ON projects
  FOR SELECT USING (company_id = get_my_company_id());

CREATE POLICY "projects_insert_own" ON projects
  FOR INSERT WITH CHECK (company_id = get_my_company_id());

CREATE POLICY "projects_update_own" ON projects
  FOR UPDATE USING (company_id = get_my_company_id());

CREATE POLICY "projects_delete_own" ON projects
  FOR DELETE USING (company_id = get_my_company_id());

-- ============================================================
-- 8. INTEGRATIONS
-- ============================================================
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "integrations_select_own" ON integrations
  FOR SELECT USING (company_id = get_my_company_id());

CREATE POLICY "integrations_insert_own" ON integrations
  FOR INSERT WITH CHECK (company_id = get_my_company_id());

CREATE POLICY "integrations_update_own" ON integrations
  FOR UPDATE USING (company_id = get_my_company_id());

CREATE POLICY "integrations_delete_own" ON integrations
  FOR DELETE USING (company_id = get_my_company_id());

-- ============================================================
-- 9. AI_RECOMMENDATIONS
-- ============================================================
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_recommendations_select_own" ON ai_recommendations
  FOR SELECT USING (company_id = get_my_company_id());

CREATE POLICY "ai_recommendations_insert_own" ON ai_recommendations
  FOR INSERT WITH CHECK (company_id = get_my_company_id());

CREATE POLICY "ai_recommendations_update_own" ON ai_recommendations
  FOR UPDATE USING (company_id = get_my_company_id());

-- ============================================================
-- VERIFICACIÓN: muestra el estado de RLS en cada tabla
-- ============================================================
SELECT
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'companies', 'users', 'products', 'inventory_transactions',
    'sales', 'customers', 'projects', 'integrations', 'ai_recommendations'
  )
ORDER BY tablename;
