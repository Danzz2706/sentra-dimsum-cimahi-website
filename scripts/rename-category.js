const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function renameCategory() {
    console.log("Renaming category 'Kukus' to 'Original' in Supabase...");

    // First, check how many products will be affected
    const { data: before, error: checkError } = await supabase
        .from('products')
        .select('id, name')
        .eq('category', 'Kukus');

    if (checkError) {
        console.error("Error checking products:", checkError);
        return;
    }

    console.log(`Found ${before.length} products with category 'Kukus'.`);

    if (before.length === 0) {
        console.log("No products found with category 'Kukus'. Database might already be updated.");
    } else {
        // Perform the update
        const { data: updated, error: updateError } = await supabase
            .from('products')
            .update({ category: 'Original' })
            .eq('category', 'Kukus')
            .select();

        if (updateError) {
            console.error("Error updating category:", updateError);
            return;
        }

        console.log(`Successfully updated ${updated.length} products to category 'Original'.`);
    }

    // Verify
    const { data: after, error: verifyError } = await supabase
        .from('products')
        .select('id, name')
        .eq('category', 'Kukus');

    if (!after || after.length === 0) {
        console.log("Verification successful: 0 products left in 'Kukus' category.");
    } else {
        console.warn(`Verification failed: ${after.length} products still in 'Kukus' category.`);
    }
}

renameCategory();
