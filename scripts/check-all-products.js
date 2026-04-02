const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllProducts() {
    const { data: allProducts } = await supabase
        .from('products')
        .select('id, name, category');

    fs.writeFileSync('output-all.json', JSON.stringify(allProducts, null, 2));
}

checkAllProducts();
