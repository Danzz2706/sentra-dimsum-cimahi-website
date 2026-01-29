const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        envVars[key.trim()] = value.trim();
    }
});

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase keys');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function listProducts() {
    const { data, error } = await supabase.from('products').select('*').order('id', { ascending: false });
    if (error) {
        console.error('Error fetching products:', error);
        return;
    }

    console.log('Products found:', data.length);
    if (data.length > 0) {
        console.log('Keys:', Object.keys(data[0]));
        console.log('First product:', data[0]);
    }
}

listProducts();
