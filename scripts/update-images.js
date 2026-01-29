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

const UPDATES = [
    {
        category: 'Mentai',
        image: 'https://images.unsplash.com/photo-1626804475297-411d8c6b7143?q=80&w=1000&auto=format&fit=crop'
    },
    {
        category: 'Kukus',
        image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=1000&auto=format&fit=crop'
    },
    {
        category: 'Goreng',
        image: 'https://images.unsplash.com/photo-1596627191435-fa6012082238?q=80&w=1000&auto=format&fit=crop'
    },
    {
        category: 'Frozen',
        image: 'https://images.unsplash.com/photo-1615887023591-614d6515c214?q=80&w=1000&auto=format&fit=crop'
    },
    {
        category: 'Minuman',
        image: 'https://images.unsplash.com/photo-1541167760496-1628856ab77e?q=80&w=1000&auto=format&fit=crop'
    }
];

async function updateImages() {
    console.log('Starting image updates...');

    for (const update of UPDATES) {
        console.log(`Updating category: ${update.category}...`);
        const { error } = await supabase
            .from('products')
            .update({ image: update.image })
            .eq('category', update.category);

        if (error) {
            console.error(`Error updating ${update.category}:`, error);
        } else {
            console.log(`Success: ${update.category}`);
        }
    }
    console.log('All updates complete.');
}

updateImages();
