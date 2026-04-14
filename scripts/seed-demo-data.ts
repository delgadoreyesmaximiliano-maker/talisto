
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Usamos service role para saltar RLS si es necesario

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedData() {
    console.log('🚀 Iniciando carga de datos realistas...');

    // 1. Obtener el ID del usuario
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    const user = users?.find(u => u.email === 'max.delgado@duocuc.cl');

    if (!user) {
        console.error('❌ Usuario no encontrado');
        return;
    }

    // 2. Obtener el company_id
    const { data: userProfile } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single();

    const companyId = userProfile?.company_id;

    if (!companyId) {
        console.error('❌ Empresa no encontrada para este usuario');
        return;
    }

    console.log(`✅ Empresa identificada: ${companyId}`);

    // 3. Crear Productos Realistas (SaaS / Tech)
    const products = [
        { name: 'Licencia talisto Pro (Anual)', sku: 'LIC-001', category: 'Software', price_sale: 450000, price_cost: 50000, stock_current: 100, stock_minimum: 10 },
        { name: 'Implementación Onboarding', sku: 'SRV-001', category: 'Servicios', price_sale: 250000, price_cost: 80000, stock_current: 50, stock_minimum: 5 },
        { name: 'Soporte Premium (Mensual)', sku: 'SRV-002', category: 'Servicios', price_sale: 45000, price_cost: 15000, stock_current: 200, stock_minimum: 20 },
        { name: 'Capacitación Equipos', sku: 'SRV-003', category: 'Educación', price_sale: 180000, price_cost: 40000, stock_current: 30, stock_minimum: 5 },
        { name: 'API Access (Enterprise)', sku: 'LIC-002', category: 'Software', price_sale: 1200000, price_cost: 100000, stock_current: 20, stock_minimum: 2 }
    ];

    console.log('📦 Insertando productos...');
    const { error: prodError } = await supabase.from('products').upsert(
        products.map(p => ({ ...p, company_id: companyId })),
        { onConflict: 'sku' }
    );
    if (prodError) console.error('Error productos:', prodError);

    // 4. Crear Clientes Realistas
    const customers = [
        { name: 'Inversiones Tech SpA', email: 'contacto@invertech.cl', plan: 'Enterprise', mrr: 1200000, status: 'active' },
        { name: 'Pyme Digital Ltda', email: 'admin@pymedigital.cl', plan: 'Pro', mrr: 450000, status: 'active' },
        { name: 'Constructora El Pilar', email: 'ventas@elpilar.cl', plan: 'Básico', mrr: 45000, status: 'active' },
        { name: 'Restaurant Delicias', email: 'hola@delicias.cl', plan: 'Pro', mrr: 450000, status: 'inactive' },
        { name: 'Agencia Creativa Sky', email: 'info@skymedia.cl', plan: 'Enterprise', mrr: 1200000, status: 'active' }
    ];

    console.log('👥 Insertando clientes...');
    const { error: custError } = await supabase.from('customers').upsert(
        customers.map(c => ({ ...c, company_id: companyId })),
        { onConflict: 'email' }
    );
    if (custError) console.error('Error clientes:', custError);

    // 5. Crear Ventas Realistas (Últimos 4 meses)
    const sales = [];
    const months = [-3, -2, -1, 0]; // Nov, Dic, Ene, Feb

    for (const offset of months) {
        const date = new Date();
        date.setMonth(date.getMonth() + offset);

        // Generar entre 5 y 10 ventas por mes
        const numSales = Math.floor(Math.random() * 5) + 5;

        for (let i = 0; i < numSales; i++) {
            const randomDay = Math.floor(Math.random() * 28) + 1;
            const saleDate = new Date(date.getFullYear(), date.getMonth(), randomDay);
            const product = products[Math.floor(Math.random() * products.length)];
            const customer = customers[Math.floor(Math.random() * customers.length)];

            sales.push({
                company_id: companyId,
                amount: product.price_sale,
                customer_name: customer.name,
                customer_email: customer.email,
                source: Math.random() > 0.5 ? 'organic' : 'manual',
                status: 'completed',
                created_at: saleDate.toISOString(),
                items: [{ name: product.name, quantity: 1, price: product.price_sale }]
            });
        }
    }

    console.log(`💰 Insertando ${sales.length} registros de ventas...`);
    const { error: salesError } = await supabase.from('sales').insert(sales);
    if (salesError) console.error('Error ventas:', salesError);

    console.log('✨ ¡Carga de datos completada exitosamente!');
}

seedData();
