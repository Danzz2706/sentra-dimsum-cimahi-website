const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProducts() {
    console.log("Checking products in Supabase...");
    const { data, error } = await supabase
        .from('products')
        .select('id, name, category');

    if (error) {
        console.error("Error fetching products:", error);
        return;
    }

    console.log("Found products:");
    data.forEach(p => {
        console.log(`- ID: ${p.id}, Name: "${p.name}", Category: "${p.category}"`);
    });

    const katori = data.find(p => p.name.toLowerCase().includes("katori"));
    if (katori) {
        console.log("\nFound target product!");
        console.log(`ID: ${katori.id}`);
        console.log(`Current Name: ${katori.name}`);
    } else {
        console.log("\n" + "Katori" + " not found in products.");
    }
}

checkProducts();
