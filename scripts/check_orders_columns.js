
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
try {
    const envPath = path.join(__dirname, '..', '.env.local');
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
} catch (e) {
    console.error('Could not load .env.local', e);
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkOrders() {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching orders:', error);
    } else {
        if (data.length > 0) {
            console.log('Orders keys:', Object.keys(data[0]));
        } else {
            console.log('Orders table is empty, cannot check keys from data.');
        }
    }
}

checkOrders();
