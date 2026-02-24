const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mngdysrxgngapcbfzlxt.supabase.co';
const supabaseKey = 'sb_secret_v3EOALLgxSNLZY3ve2uxDQ_rQ7ZcKF3';

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function listUsers() {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Error fetching users:', error);
        return;
    }

    console.log('--- USUARIOS ENCONTRADOS ---');
    users.forEach(u => {
        console.log(`Email: ${u.email} (Creado: ${new Date(u.created_at).toLocaleString()})`);
    });
    console.log('---------------------------');
}

listUsers();
