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

const products = [
    {
        name: "Dimsum Ayam Original",
        description: "Dimsum ayam lembut dengan rasa otentik, disajikan hangat.",
        price: 15000,
        image: "https://images.unsplash.com/photo-1496116218417-1a781b1c423c?auto=format&fit=crop&q=80&w=800",
        category: "Kukus",
        is_popular: true,
        stock: 100
    },
    {
        name: "Dimsum Udang",
        description: "Kombinasi ayam dan udang segar yang menggugah selera.",
        price: 18000,
        image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=800",
        category: "Kukus",
        is_popular: true,
        stock: 100
    },
    {
        name: "Dimsum Nori",
        description: "Dimsum balut rumput laut dengan isian padat.",
        price: 16000,
        image: "https://images.unsplash.com/photo-1596627191435-fa6012082238?auto=format&fit=crop&q=80&w=800",
        category: "Kukus",
        is_popular: false,
        stock: 100
    },
    {
        name: "Lumpia Kulit Tahu",
        description: "Lumpia goreng renyah dengan kulit tahu premium.",
        price: 17000,
        image: "https://images.unsplash.com/photo-1541696490-8744a5dc0228?auto=format&fit=crop&q=80&w=800",
        category: "Goreng",
        is_popular: true,
        stock: 100
    },
    {
        name: "Hakau Udang",
        description: "Kulit transparan lembut dengan udang utuh di dalamnya.",
        price: 20000,
        image: "https://images.unsplash.com/photo-1626804475297-411d8c6b7143?auto=format&fit=crop&q=80&w=800",
        category: "Kukus",
        is_popular: false,
        stock: 100
    },
    {
        name: "Pao Telur Asin",
        description: "Bakpao lembut dengan isian custard telur asin meleleh.",
        price: 12000,
        image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=800",
        category: "Kukus",
        is_popular: false,
        stock: 100
    },
    {
        name: "Dimsum Frozen Mix A (Isi 10)",
        description: "Paket dimsum beku untuk stok di rumah. Praktis!",
        price: 35000,
        image: "https://images.unsplash.com/photo-1615887023516-9b9089f27d89?auto=format&fit=crop&q=80&w=800",
        category: "Frozen",
        is_popular: false,
        stock: 100
    },
    {
        name: "Es Teh Manis Jumbo",
        description: "Teh manis dingin segar ukuran jumbo.",
        price: 5000,
        image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=800",
        category: "Minuman",
        is_popular: true,
        stock: 100
    },
];

async function seedProducts() {
    console.log('Seeding products...');

    // Check if products exist
    const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error('Error checking products:', countError);
        return;
    }

    if (count > 0) {
        console.log(`Database already has ${count} products. Skipping seed.`);
        return;
    }

    const { data, error } = await supabase
        .from('products')
        .insert(products)
        .select();

    if (error) {
        console.error('Error seeding products:', error);
    } else {
        console.log(`Successfully seeded ${data.length} products!`);
    }
}

seedProducts();
