const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mngdysrxgngapcbfzlxt.supabase.co';
const supabaseKey = 'sb_secret_v3EOALLgxSNLZY3ve2uxDQ_rQ7ZcKF3';

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function seedData() {
    console.log('1. Buscando usuario renattahf@gmail.com...');
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) return console.error('Error buscando usuarios:', authError);

    const targetUser = users.find(u => u.email === 'renattahf@gmail.com');
    if (!targetUser) return console.log('❌ No se encontró el usuario renattahf@gmail.com');

    console.log('2. Buscando Company ID vinculada a este usuario...');
    const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', targetUser.id)
        .single();

    if (profileError || !userProfile?.company_id) {
        return console.log('❌ El usuario no tiene una compañía configurada. Debe completar el onboarding (setup) primero.');
    }

    const companyId = userProfile.company_id;
    console.log(`✅ Company ID encontrada: ${companyId}. Inyectando datos...`);

    // --- PRODUCTOS ---
    const products = [
        { company_id: companyId, name: 'Monitor LG 27" 4K', sku: 'MON-001', category: 'Pantallas', price_sale: 289990, price_cost: 195000, stock_current: 12, stock_minimum: 5, supplier: 'LG Chile' },
        { company_id: companyId, name: 'Teclado Mecánico', sku: 'TEC-001', category: 'Periféricos', price_sale: 34990, price_cost: 18000, stock_current: 45, stock_minimum: 10, supplier: 'Redragon' },
        { company_id: companyId, name: 'Notebook Lenovo ThinkPad', sku: 'NOT-001', category: 'Computadores', price_sale: 899990, price_cost: 620000, stock_current: 3, stock_minimum: 5, supplier: 'Lenovo' },
        { company_id: companyId, name: 'Silla Gamer Cougar', sku: 'SIL-001', category: 'Mobiliario', price_sale: 279990, price_cost: 180000, stock_current: 2, stock_minimum: 3, supplier: 'Cougar' },
        { company_id: companyId, name: 'Tablet Samsung Galaxy', sku: 'TAB-001', category: 'Tablets', price_sale: 499990, price_cost: 350000, stock_current: 4, stock_minimum: 3, supplier: 'Samsung' }
    ];

    const { error: prodError } = await supabase.from('products').insert(products);
    if (prodError) console.error('❌ Error insertando productos:', prodError);
    else console.log('✅ 5 productos inyectados.');

    // --- CLIENTES ---
    const customers = [
        { company_id: companyId, name: 'TechStore Santiago', email: 'ventas@techstore.cl', plan: 'Pro', mrr: 150000, status: 'active' },
        { company_id: companyId, name: 'Importadora del Sur', email: 'contacto@importadoradelsur.cl', plan: 'Enterprise', mrr: 450000, status: 'active' },
        { company_id: companyId, name: 'GameZone Chile', email: 'admin@gamezone.cl', plan: 'Pro', mrr: 120000, status: 'active' }
    ];

    const { error: custError } = await supabase.from('customers').insert(customers);
    if (custError) console.error('❌ Error insertando clientes:', custError);
    else console.log('✅ 3 clientes inyectados.');

    // --- VENTAS ---
    function getPastDate(days) {
        const d = new Date();
        d.setDate(d.getDate() - days);
        return d.toISOString();
    }

    const sales = [
        { company_id: companyId, source: 'Tienda Online', amount: 289990, status: 'completed', customer_name: 'TechStore Santiago', customer_email: 'ventas@techstore.cl', created_at: getPastDate(1) },
        { company_id: companyId, source: 'WhatsApp', amount: 34990, status: 'completed', customer_name: 'María González', customer_email: 'maria.gonzalez@gmail.com', created_at: getPastDate(2) },
        { company_id: companyId, source: 'Presencial', amount: 899990, status: 'completed', customer_name: 'Importadora del Sur', customer_email: 'contacto@importadoradelsur.cl', created_at: getPastDate(3) },
        { company_id: companyId, source: 'Tienda Online', amount: 79990, status: 'completed', customer_name: 'TechStore Santiago', customer_email: 'ventas@techstore.cl', created_at: getPastDate(5) },
        { company_id: companyId, source: 'Tienda Online', amount: 349990, status: 'completed', customer_name: 'GameZone Chile', customer_email: 'admin@gamezone.cl', created_at: getPastDate(10) }
    ];

    const { error: saleError } = await supabase.from('sales').insert(sales);
    if (saleError) console.error('❌ Error insertando ventas:', saleError);
    else console.log('✅ 5 ventas recientes inyectadas.');

    console.log('🚀 SEED COMPLETADO PARA RENATTAHF@GMAIL.COM');
}

seedData();
