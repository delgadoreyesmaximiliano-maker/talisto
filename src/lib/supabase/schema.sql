-- ============================================
-- Talisto - Complete Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Companies table
-- ============================================
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  rut VARCHAR(20) UNIQUE,
  industry VARCHAR(50) NOT NULL CHECK (industry IN ('ecommerce', 'saas', 'retail', 'marketing', 'restaurant', 'services')),
  plan VARCHAR(20) DEFAULT 'basic' CHECK (plan IN ('basic', 'pro', 'enterprise')),
  created_at TIMESTAMP DEFAULT NOW(),
  settings JSONB DEFAULT '{}'::jsonb
);

-- ============================================
-- Users table
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  email VARCHAR(200) UNIQUE NOT NULL,
  name VARCHAR(200),
  role VARCHAR(20) DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Products table
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  sku VARCHAR(100),
  name VARCHAR(200) NOT NULL,
  category VARCHAR(100),
  stock_current INT DEFAULT 0,
  stock_minimum INT DEFAULT 10,
  price_sale DECIMAL(10,2),
  price_cost DECIMAL(10,2),
  supplier VARCHAR(200),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Inventory Transactions table
-- ============================================
CREATE TABLE inventory_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('entrada', 'salida')),
  quantity INT NOT NULL,
  reason VARCHAR(100),
  notes TEXT,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Sales table
-- ============================================
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  external_id VARCHAR(100),
  source VARCHAR(50),
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50),
  customer_name VARCHAR(200),
  customer_email VARCHAR(200),
  items JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Customers table
-- ============================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200),
  plan VARCHAR(50),
  mrr DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'active',
  last_activity TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Projects table
-- ============================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  name VARCHAR(200) NOT NULL,
  budget DECIMAL(10,2),
  hours_estimated INT,
  hours_logged INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Integrations table
-- ============================================
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  credentials JSONB,
  last_sync TIMESTAMP,
  sync_frequency VARCHAR(20) DEFAULT 'hourly',
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- AI Recommendations table
-- ============================================
CREATE TABLE ai_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('critical', 'opportunity', 'suggestion')),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  impact_estimate DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Indexes for performance
-- ============================================
CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_products_company ON products(company_id);
CREATE INDEX idx_products_stock ON products(company_id, stock_current);
CREATE INDEX idx_transactions_product ON inventory_transactions(product_id);
CREATE INDEX idx_transactions_date ON inventory_transactions(company_id, created_at);
CREATE INDEX idx_sales_company_date ON sales(company_id, created_at);
CREATE INDEX idx_customers_company_status ON customers(company_id, status);
CREATE INDEX idx_projects_company ON projects(company_id);
CREATE INDEX idx_integrations_company ON integrations(company_id);
CREATE INDEX idx_recommendations_company_status ON ai_recommendations(company_id, status);
