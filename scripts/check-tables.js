const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    // There is no easy way to list tables via the JS client without direct PostgreSQL access (e.g., via RPC or pg metadata)
    // But we can try querying a 'categories' table to see if it exists
    const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('*');

    fs.writeFileSync('output-tables.json', JSON.stringify({
        categories_table_fetched: !catError || catError.code !== '42P01', // 42P01 is undefined_table in Postgres
        categories_data: categories,
        error: catError
    }, null, 2));
}

checkTables();
