const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProducts() {
    const { data: kukus } = await supabase
        .from('products')
        .select('id, name, category, description')
        .ilike('name', '%kukus%');

    const { data: katori } = await supabase
        .from('products')
        .select('id, name, category, description')
        .ilike('name', '%katori%');

    const { data: kukusCat } = await supabase
        .from('products')
        .select('id, name, category, description')
        .eq('category', 'Kukus');

    const { data: originalCat } = await supabase
        .from('products')
        .select('id, name, category, description')
        .eq('category', 'Original');

    const result = {
        kukus_in_name: kukus,
        katori_in_name: katori,
        category_kukus: kukusCat,
        category_original: originalCat
    };

    fs.writeFileSync('output.json', JSON.stringify(result, null, 2));
}

checkProducts();
