const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase URL or Service Role Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createBucket() {
    console.log('Checking "products" bucket...');

    // 1. Create Bucket if not exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
        console.error('Error listing buckets:', listError);
        return;
    }

    const productsBucket = buckets.find(b => b.name === 'products');

    if (!productsBucket) {
        console.log('Bucket "products" not found. Creating...');
        const { data, error } = await supabase.storage.createBucket('products', {
            public: true,
            fileSizeLimit: 10485760, // 10MB
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
        });

        if (error) {
            console.error('Error creating bucket:', error);
        } else {
            console.log('Bucket "products" created successfully!');
        }
    } else {
        console.log('Bucket "products" already exists.');

        // Ensure it is public
        if (!productsBucket.public) {
            console.log('Updating bucket to be public...');
            const { error } = await supabase.storage.updateBucket('products', {
                public: true
            });
            if (error) console.error('Error updating bucket:', error);
            else console.log('Bucket updated to public.');
        }
    }

    // 2. Create RLS Policies (This is tricky via JS client as it usually requires SQL)
    // The Service Role key bypasses RLS, but the client-side upload needs policies.
    // Creating policies via Storage API isn't directly supported in the same way as SQL.
    // However, if the bucket is public, READ is allowed.
    // WRITE still needs a policy.

    console.log('\nIMPORTANT: You must ensure RLS policies allow uploads.');
    console.log('Since I cannot run SQL directly via this client easily without the SQL Editor or specific setup,');
    console.log('Please go to the Supabase Dashboard -> Storage -> Policies and add:');
    console.log('1. Policy "Give users access to own folder" (or confusingly, just "Allow authenticated uploads")');
    console.log('   - INSERT: authenticated users');
    console.log('   - SELECT: public (already set by public bucket)');
}

createBucket();
