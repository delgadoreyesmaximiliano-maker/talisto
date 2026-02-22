-- ============================================
-- Talisto - Seed Data (Demo / Ficticios)
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================

-- Get the first company_id dynamically
DO $$
DECLARE
  v_company_id UUID;
BEGIN
  SELECT id INTO v_company_id FROM companies LIMIT 1;

  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'No company found. Please sign up first.';
  END IF;

  -- ==========================================
  -- PRODUCTS (15 productos variados)
  -- ==========================================
  INSERT INTO products (company_id, name, sku, category, price_sale, price_cost, stock_current, stock_minimum, supplier) VALUES
    (v_company_id, 'Monitor LG 27" 4K', 'MON-001', 'Pantallas', 289990, 195000, 12, 5, 'LG Chile'),
    (v_company_id, 'Teclado Mecánico Redragon', 'TEC-001', 'Periféricos', 34990, 18000, 45, 10, 'Redragon'),
    (v_company_id, 'Mouse Logitech MX Master 3', 'MOU-001', 'Periféricos', 79990, 52000, 8, 10, 'Logitech Chile'),
    (v_company_id, 'Notebook Lenovo ThinkPad', 'NOT-001', 'Computadores', 899990, 620000, 3, 5, 'Lenovo'),
    (v_company_id, 'Webcam Logitech C920', 'WEB-001', 'Periféricos', 54990, 32000, 22, 8, 'Logitech Chile'),
    (v_company_id, 'Audífonos Sony WH-1000XM5', 'AUD-001', 'Audio', 349990, 240000, 6, 3, 'Sony Chile'),
    (v_company_id, 'SSD Samsung 1TB NVMe', 'SSD-001', 'Almacenamiento', 89990, 55000, 30, 15, 'Samsung'),
    (v_company_id, 'Hub USB-C 7 en 1', 'HUB-001', 'Accesorios', 29990, 12000, 50, 20, 'Ugreen'),
    (v_company_id, 'Silla Gamer Cougar Armor', 'SIL-001', 'Mobiliario', 279990, 180000, 2, 3, 'Cougar'),
    (v_company_id, 'Cable HDMI 2.1 3m', 'CAB-001', 'Cables', 12990, 4500, 80, 30, 'Ugreen'),
    (v_company_id, 'Mousepad XXL RGB', 'PAD-001', 'Accesorios', 19990, 8000, 35, 15, 'Redragon'),
    (v_company_id, 'Memoria RAM 16GB DDR5', 'RAM-001', 'Componentes', 54990, 35000, 18, 10, 'Kingston'),
    (v_company_id, 'Fuente de Poder 650W', 'PSU-001', 'Componentes', 69990, 42000, 7, 5, 'EVGA'),
    (v_company_id, 'Tablet Samsung Galaxy Tab S9', 'TAB-001', 'Tablets', 499990, 350000, 4, 3, 'Samsung'),
    (v_company_id, 'Cargador USB-C 65W GaN', 'CAR-001', 'Accesorios', 24990, 10000, 60, 25, 'Anker');

  -- ==========================================
  -- CUSTOMERS (10 clientes ficticios)
  -- ==========================================
  INSERT INTO customers (company_id, name, email, plan, mrr, status, last_activity) VALUES
    (v_company_id, 'TechStore Santiago', 'ventas@techstore.cl', 'Pro', 150000, 'active', NOW() - INTERVAL '1 day'),
    (v_company_id, 'María González', 'maria.gonzalez@gmail.com', 'Básico', 25000, 'active', NOW() - INTERVAL '3 days'),
    (v_company_id, 'Importadora del Sur', 'contacto@importadoradelsur.cl', 'Enterprise', 450000, 'active', NOW() - INTERVAL '2 days'),
    (v_company_id, 'Pedro Muñoz', 'pedro.munoz@outlook.com', 'Pro', 75000, 'active', NOW() - INTERVAL '5 days'),
    (v_company_id, 'GameZone Chile', 'admin@gamezone.cl', 'Pro', 120000, 'active', NOW() - INTERVAL '1 day'),
    (v_company_id, 'Oficinas Modernas SpA', 'compras@oficinasmodernas.cl', 'Enterprise', 380000, 'active', NOW() - INTERVAL '7 days'),
    (v_company_id, 'Catalina Rojas', 'catalina.rojas@yahoo.com', 'Básico', 15000, 'inactive', NOW() - INTERVAL '30 days'),
    (v_company_id, 'DataCenter Pro', 'soporte@datacenterpro.cl', 'Enterprise', 520000, 'active', NOW() - INTERVAL '1 day'),
    (v_company_id, 'José Hernández', 'jose.hernandez@gmail.com', 'Básico', 25000, 'active', NOW() - INTERVAL '10 days'),
    (v_company_id, 'Distribuidora Norte', 'ventas@distnorte.cl', 'Pro', 95000, 'active', NOW() - INTERVAL '4 days');

  -- ==========================================
  -- SALES (20 ventas de los últimos 30 días)
  -- ==========================================
  INSERT INTO sales (company_id, source, amount, status, customer_name, customer_email, created_at) VALUES
    (v_company_id, 'Tienda Online', 289990, 'completed', 'TechStore Santiago', 'ventas@techstore.cl', NOW() - INTERVAL '1 day'),
    (v_company_id, 'Presencial', 34990, 'completed', 'María González', 'maria.gonzalez@gmail.com', NOW() - INTERVAL '1 day'),
    (v_company_id, 'Tienda Online', 899990, 'completed', 'Importadora del Sur', 'contacto@importadoradelsur.cl', NOW() - INTERVAL '2 days'),
    (v_company_id, 'WhatsApp', 79990, 'completed', 'Pedro Muñoz', 'pedro.munoz@outlook.com', NOW() - INTERVAL '2 days'),
    (v_company_id, 'Tienda Online', 349990, 'completed', 'GameZone Chile', 'admin@gamezone.cl', NOW() - INTERVAL '3 days'),
    (v_company_id, 'Presencial', 54990, 'completed', 'Oficinas Modernas SpA', 'compras@oficinasmodernas.cl', NOW() - INTERVAL '3 days'),
    (v_company_id, 'Tienda Online', 179980, 'completed', 'DataCenter Pro', 'soporte@datacenterpro.cl', NOW() - INTERVAL '4 days'),
    (v_company_id, 'WhatsApp', 29990, 'completed', 'José Hernández', 'jose.hernandez@gmail.com', NOW() - INTERVAL '5 days'),
    (v_company_id, 'Presencial', 559980, 'completed', 'Importadora del Sur', 'contacto@importadoradelsur.cl', NOW() - INTERVAL '5 days'),
    (v_company_id, 'Tienda Online', 89990, 'completed', 'TechStore Santiago', 'ventas@techstore.cl', NOW() - INTERVAL '6 days'),
    (v_company_id, 'Tienda Online', 24990, 'completed', 'Distribuidora Norte', 'ventas@distnorte.cl', NOW() - INTERVAL '7 days'),
    (v_company_id, 'Presencial', 69990, 'completed', 'GameZone Chile', 'admin@gamezone.cl', NOW() - INTERVAL '8 days'),
    (v_company_id, 'WhatsApp', 499990, 'completed', 'Oficinas Modernas SpA', 'compras@oficinasmodernas.cl', NOW() - INTERVAL '9 days'),
    (v_company_id, 'Tienda Online', 34990, 'completed', 'María González', 'maria.gonzalez@gmail.com', NOW() - INTERVAL '10 days'),
    (v_company_id, 'Presencial', 279990, 'completed', 'DataCenter Pro', 'soporte@datacenterpro.cl', NOW() - INTERVAL '12 days'),
    (v_company_id, 'Tienda Online', 12990, 'completed', 'Pedro Muñoz', 'pedro.munoz@outlook.com', NOW() - INTERVAL '14 days'),
    (v_company_id, 'WhatsApp', 109980, 'completed', 'TechStore Santiago', 'ventas@techstore.cl', NOW() - INTERVAL '15 days'),
    (v_company_id, 'Tienda Online', 19990, 'completed', 'José Hernández', 'jose.hernandez@gmail.com', NOW() - INTERVAL '18 days'),
    (v_company_id, 'Presencial', 899990, 'completed', 'Importadora del Sur', 'contacto@importadoradelsur.cl', NOW() - INTERVAL '20 days'),
    (v_company_id, 'Tienda Online', 54990, 'completed', 'Distribuidora Norte', 'ventas@distnorte.cl', NOW() - INTERVAL '25 days');

  RAISE NOTICE 'Seed data inserted successfully for company: %', v_company_id;
END $$;
