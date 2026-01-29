const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Read .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
let supabaseUrl, supabaseKey;

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim();
            if (key === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = value;
            if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') supabaseKey = value;
        }
    });
} catch (e) {
    console.error("Could not read .env.local", e);
    process.exit(1);
}

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase URL or Key in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    console.log("Attempting to insert test order...");

    const { data, error } = await supabase
        .from("orders")
        .insert([
            {
                customer_name: "Debug User",
                customer_phone: "08123456789",
                customer_address: "Debug Address",
                total_price: 10000,
                items: [],
                status: "pending",
                payment_method: "debug",
                order_type: "takeaway" // This is the new column
            },
        ])
        .select()
        .single();

    if (error) {
        console.error("Insert Failed!");
        console.error("Error Code:", error.code);
        console.error("Error Message:", error.message);
        console.error("Full Error Object:", JSON.stringify(error, null, 2));
    } else {
        console.log("Insert Successful!", data);
        // Clean up
        await supabase.from("orders").delete().eq("id", data.id);
    }
}

testInsert();
