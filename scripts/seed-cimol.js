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
const supabaseKey = envVars['SUPABASE_SERVICE_ROLE_KEY'] || envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase keys');
    process.exit(1);
}

console.log('Using key:', envVars['SUPABASE_SERVICE_ROLE_KEY'] ? 'Service Role' : 'Anon');

const supabase = createClient(supabaseUrl, supabaseKey);

const cimolProducts = [
    {
        name: "Cimol Bojot Khas Garut",
        description: "Cimol dengan bumbu minyak bawang dan cabai bubuk yang pedas gurih.",
        price: 15000,
        category: "Cimol",
        image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=500", // Placeholder (Spicy food)
        stock: 50,
        is_available: true
    },
    {
        name: "Cimol Keju Lumer",
        description: "Cimol crispy di luar dengan isian keju mozarella yang lumer di mulut.",
        price: 18000,
        category: "Cimol",
        image: "https://images.unsplash.com/photo-1548340748-6d2b7d7daa80?auto=format&fit=crop&q=80&w=500", // Placeholder (Cheesy food)
        stock: 40,
        is_available: true
    },
    {
        name: "Cimol Kering Pedas Daun Jeruk",
        description: "Cimol garing dengan taburan bumbu pedas dan aroma daun jeruk yang segar.",
        price: 12000,
        category: "Cimol",
        image: "https://images.unsplash.com/photo-1626804475297-411d8c6b7143?auto=format&fit=crop&q=80&w=500", // Placeholder (Fried snack)
        stock: 60,
        is_available: true
    }
];

async function seedCimol() {
    console.log('Seeding Cimol products...');

    const { data, error } = await supabase
        .from('products')
        .insert(cimolProducts);

    if (error) {
        console.error('Error inserting products:', error);
    } else {
        console.log('Successfully added products:', data.length);
        data.forEach(p => console.log(`- ${p.name} (ID: ${p.id})`));
    }
}

seedCimol();
